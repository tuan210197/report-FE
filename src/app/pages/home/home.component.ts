import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { firstValueFrom } from 'rxjs';
import Drilldown from 'highcharts/modules/drilldown';
import { ShareService } from '../../services/share.service';
import { TranslateModule } from '@ngx-translate/core';
import { AppTranslateService } from '../../services/translate.service';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { MatIconModule } from '@angular/material/icon';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
const moment = _rollupMoment || _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};
if (!Highcharts.Chart.prototype.addSeriesAsDrilldown) {
  Drilldown(Highcharts);
}

export default Highcharts;

interface ChartData {
  categoryName: string;
  total: number;
  completed: number;
  remaining: number;
  news: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HighchartsChartModule, TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [
    provideMomentDateAdapter(MY_FORMATS),
  ],
  // encapsulation: ViewEncapsulation.None,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; // Gắn Highcharts vào biến toàn cục
  chartOptions: Highcharts.Options = {}; // Cấu hình biểu đồ

  total: number = 0;
  news: number = 0;
  remain: number = 0;
  completed: number = 0;
  readonly date = new FormControl(moment());
  fromYear = new FormControl<Moment | null>(null);  // Ban đầu trống
  toYear = new FormControl<Moment | null>(null);
  constructor(
    private share: ShareService, private router: Router, private dataService: DataService
  ) { }
  translateService = inject(AppTranslateService);

  ngOnInit(): void {
    this.loadChartData();
  }

  searchFromTo() {
    if (this.fromYear.value && this.toYear.value && this.fromYear.value.year() > this.toYear.value.year()) {
      alert("From year must be less than To year");
      return;
    }
    var val = {
      from: this.fromYear.value?.year(),
      to: this.toYear.value?.year()
    }
    this.loadChartDataFromTo(val);
  }
  setFromYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    this.fromYear.setValue(moment(normalizedMonthAndYear.year().toString(), 'YYYY')); // Chỉ lấy năm

    // const ctrlValue = this.fromYear.value!;
    // ctrlValue.year(normalizedMonthAndYear.year());
    // this.fromYear.setValue(ctrlValue); // Lưu năm
    datepicker.close();
  }
  setToYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    this.toYear.setValue(moment(normalizedMonthAndYear.year().toString(), 'YYYY')); // Chỉ lấy năm

    // const ctrlValue = this.toYear.value!;
    // ctrlValue.year(normalizedMonthAndYear.year());
    // this.toYear.setValue(ctrlValue); // Lưu năm
    datepicker.close();
  }

  // setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {

  //   const ctrlValue = this.date.value!;
  //   ctrlValue.year(normalizedMonthAndYear.year());
  //   datepicker.close();

  // this.loadChartData(this.date.value?.year() ?? new Date().getFullYear());
  // }


  async loadChartData() {

    const drilldownData: any = await firstValueFrom(this.share.getCompletedProject());
    if (drilldownData && drilldownData.length > 0) {
      this.total = drilldownData[0].total;
      this.news = drilldownData[0].news;
      this.remain = drilldownData[0].remain;
      this.completed = drilldownData[0].completed;
    }
    this.share.getCharts().subscribe((data: any) => {

      const data2: ChartData[] = data as unknown as ChartData[];
      const total: [string, number, string][] = data2.map(item => [item.categoryName, item.total, item.categoryName + ' total']);
      const completed: [string, number][] = data2.map(item => [item.categoryName, item.completed]);
      const remaining: [string, number][] = data2.map(item => [item.categoryName, item.remaining]);
      const news: [string, number][] = data2.map(item => [item.categoryName, item.news]);


      const categories = total.map(([category]) => category);
      const totals = total.map(([_, total]) => total);
      const labels = total.map(([_, __, label]) => label);

      const data1 = categories.map((category, index) => ({
        name: category,
        y: totals[index],
        drilldown: labels[index]
      }));

      interface CategoryData {
        categoryName: string;
        completed: number;
        remaining: number;
        news: number;
      }

      interface CategoryObjects {
        [key: string]: [string, number][];
      }

      const categoryObjects: CategoryObjects = data.reduce((acc: CategoryObjects, { categoryName, completed, remaining, news }: CategoryData) => {
        acc[categoryName] = [
          ["Completed", completed],
          ["In Progress", remaining],
          ["Canceled", news]
        ];
        return acc;
      }, {} as CategoryObjects);

      this.chartOptions = {
        chart: {
          type: 'column',
        },

        title: {
          text: ''
        },
        accessibility: {
          enabled: false, // Disable accessibility to remove the warning
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          title: {
            text: 'Number of Projects'
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {

          series: {
            borderWidth: 1,
            dataLabels: {
              enabled: true,
              format: '{point.y}'
            },

          }, column: {
            dataLabels: {
              enabled: true,
              style: {
                fontSize: '1em',
                textOutline: 'none' // Xóa viền mặc định của chữ
              }
            }
          }
        },
        series: [
          {
            type: 'column',
            name: 'Total',
            colorByPoint: true,
            data: [
              {
                name: 'Total Projects',
                y: this.total,
                drilldown: 'total'
              },
              {
                name: 'Completed',
                y: this.completed,
                drilldown: 'completed',

              },
              {
                name: 'In Progress',
                y: this.remain,
                drilldown: 'remaining'
              },
              {
                name: 'Canceled',
                y: this.news,
                drilldown: 'new'
              }
            ]
          }
        ],
        drilldown: {
          breadcrumbs: {
            position: {
              align: 'right'
            }
          },
          series: [
            {
              type: 'column',
              id: 'total',
              data: data1,


            },
            {
              type: 'column',
              id: 'completed',
              data: completed,
              point: {
                events: {
                  click: (event: any) => {
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, year };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'remaining',
              data: remaining,
              point: {
                events: {
                  click: (event: any) => {
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, year };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'new',
              data: news,
              point: {
                events: {
                  click: (event: any) => {
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, year };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: '4G',
              data: total
            },
            {
              type: 'column',
              id: '4G total',
              data: categoryObjects["4G"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[0].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data2 = { category, color, isCompleted };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'CCTV total',
              data: categoryObjects["CCTV"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[1].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()

                    const data2 = { category, color, isCompleted };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'CORE NETWORK total',
              data: categoryObjects["CORE NETWORK"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[2].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()

                    const data2 = { category, color, isCompleted };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'DARK FIBER total',
              data: categoryObjects["DARK FIBER"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[3].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()

                    const data2 = { category, color, isCompleted };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'ECARD total',
              data: categoryObjects["ECARD"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[4].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()

                    const data2 = { category, color, isCompleted };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'INTERNET & LEANSED LINE total',
              data: categoryObjects["INTERNET & LEANSED LINE"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[5].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()

                    const data2 = { category, color, isCompleted };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'IP PHONE total',
              data: categoryObjects["IP PHONE"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[6].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()

                    const data2 = { category, color, isCompleted };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'LAN NETWORK total',
              data: categoryObjects["LAN NETWORK"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[7].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()

                    const data2 = { category, color, isCompleted };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
          ] // Không cần thêm series ở đây; chúng được thêm động trong sự kiện click
        },
        credits: {
          enabled: false
        }
      };
      Highcharts.chart('container', this.chartOptions);
    });
  };


  async loadChartDataFromTo(data: any) {

    debugger;
    var val = {
      from: data.from,
      to: data.to
    };
    console.log(val);
    const drilldownData: any = await firstValueFrom(this.share.getCompletedProjectFromTo(val));
    if (drilldownData && drilldownData.length > 0) {
      this.total = drilldownData[0].total;
      this.news = drilldownData[0].news;
      this.remain = drilldownData[0].remain;
      this.completed = drilldownData[0].completed;
    }
    this.share.getChartFromTo(val).subscribe((data: any) => {

      const data2: ChartData[] = data as unknown as ChartData[];
      const total: [string, number, string][] = data2.map(item => [item.categoryName, item.total, item.categoryName + ' total']);
      const completed: [string, number][] = data2.map(item => [item.categoryName, item.completed]);
      const remaining: [string, number][] = data2.map(item => [item.categoryName, item.remaining]);
      const news: [string, number][] = data2.map(item => [item.categoryName, item.news]);


      const categories = total.map(([category]) => category);
      const totals = total.map(([_, total]) => total);
      const labels = total.map(([_, __, label]) => label);

      const data1 = categories.map((category, index) => ({
        name: category,
        y: totals[index],
        drilldown: labels[index]
      }));

      interface CategoryData {
        categoryName: string;
        completed: number;
        remaining: number;
        news: number;
      }

      interface CategoryObjects {
        [key: string]: [string, number][];
      }

      const categoryObjects: CategoryObjects = data.reduce((acc: CategoryObjects, { categoryName, completed, remaining, news }: CategoryData) => {
        acc[categoryName] = [
          ["Completed", completed],
          ["In Progress", remaining],
          ["Canceled", news]
        ];
        return acc;
      }, {} as CategoryObjects);

      this.chartOptions = {
        chart: {
          type: 'column',
        },
        title: {
          text: ''
        },
        accessibility: {
          enabled: false, // Disable accessibility to remove the warning
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          title: {
            text: 'Number of Projects'
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          series: {
            borderWidth: 1,
            dataLabels: {
              enabled: true,
              format: '{point.y}'
            },

          }
        },
        series: [
          {
            type: 'column',
            name: 'Total',
            colorByPoint: true,
            data: [
              {
                name: 'Total Projects',
                y: this.total,
                drilldown: 'total'
              },
              {
                name: 'Completed',
                y: this.completed,
                drilldown: 'completed',

              },
              {
                name: 'In Progress',
                y: this.remain,
                drilldown: 'remaining'
              },
              {
                name: 'Canceled',
                y: this.news,
                drilldown: 'new'
              }
            ]
          }
        ],
        drilldown: {
          breadcrumbs: {
            position: {
              align: 'right'
            }
          },
          series: [
            {
              type: 'column',
              id: 'total',
              data: data1,


            },
            {
              type: 'column',
              id: 'completed',
              data: completed,
              point: {
                events: {
                  click: (event: any) => {
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const from = this.fromYear.value?.year();
                    const to = this.toYear.value?.year();
                    const data = { category, color, from, to };

                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'remaining',
              data: remaining,
              point: {
                events: {
                  click: (event: any) => {
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const from = this.fromYear.value?.year();
                    const to = this.toYear.value?.year();
                    const data = { category, color, from, to };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'new',
              data: news,
              point: {
                events: {
                  click: (event: any) => {
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const from = this.fromYear.value?.year();
                    const to = this.toYear.value?.year();
                    const data = { category, color, from, to };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: '4G',
              data: total
            },
            {
              type: 'column',
              id: '4G total',
              data: categoryObjects["4G"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[0].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const from = this.fromYear.value?.year() ?? new Date().getFullYear();
                    const to = this.toYear.value?.year();
                    const data2 = { category, color, isCompleted, from, to };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'CCTV total',
              data: categoryObjects["CCTV"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[1].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const from = this.fromYear.value?.year() ?? new Date().getFullYear();
                    const to = this.toYear.value?.year();
                    const data2 = { category, color, isCompleted, from, to };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'CORE NETWORK total',
              data: categoryObjects["CORE NETWORK"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[2].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const from = this.fromYear.value?.year() ?? new Date().getFullYear();
                    const to = this.toYear.value?.year();
                    const data2 = { category, color, isCompleted, from, to };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'DARK FIBER total',
              data: categoryObjects["DARK FIBER"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[3].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const from = this.fromYear.value?.year() ?? new Date().getFullYear();
                    const to = this.toYear.value?.year();
                    const data2 = { category, color, isCompleted, from, to };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'ECARD total',
              data: categoryObjects["ECARD"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[4].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const from = this.fromYear.value?.year() ?? new Date().getFullYear();
                    const to = this.toYear.value?.year();
                    const data2 = { category, color, isCompleted, from, to };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'INTERNET & LEANSED LINE total',
              data: categoryObjects["INTERNET & LEANSED LINE"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[5].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const from = this.fromYear.value?.year() ?? new Date().getFullYear();
                    const to = this.toYear.value?.year();
                    const data2 = { category, color, isCompleted, from, to };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'IP PHONE total',
              data: categoryObjects["IP PHONE"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[6].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const from = this.fromYear.value?.year() ?? new Date().getFullYear();
                    const to = this.toYear.value?.year();
                    const data2 = { category, color, isCompleted, from, to };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'LAN NETWORK total',
              data: categoryObjects["LAN NETWORK"],
              point: {
                events: {
                  click: (event: any) => {

                    const category = data[7].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const from = this.fromYear.value?.year() ?? new Date().getFullYear();
                    const to = this.toYear.value?.year();
                    const data2 = { category, color, isCompleted, from, to };
                    this.dataService.changeData(data2);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
          ] // Không cần thêm series ở đây; chúng được thêm động trong sự kiện click
        },
        credits: {
          enabled: false
        }
      };
      Highcharts.chart('container', this.chartOptions);
    });
  };

}








