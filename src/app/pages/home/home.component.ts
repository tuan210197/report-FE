import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
import { Colors } from '../../common/color-chart';
import * as Highcharts from 'highcharts';



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
  constructed: number;
  equip: number;
  remaining: number;
  cancelled: number;
  // acceptance: number;
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
  cancelled: number = 0;
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
    this.getYear();
  }

  getYear() {
    this.share.getMinMaxYear().subscribe((data: any) => {
      console.log(data);
      this.fromYear.setValue(moment(data.data.minYear, 'YYYY')); // Mặc định là năm trước
      this.toYear.setValue(moment(data.data.maxYear, 'YYYY')); // Mặc định là năm hiện tại
    })
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
    datepicker.close();
  }
  setToYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    this.toYear.setValue(moment(normalizedMonthAndYear.year().toString(), 'YYYY')); // Chỉ lấy năm
    datepicker.close();
  }

  async loadChartData() {
    const drilldownData: any = await firstValueFrom(this.share.getCompletedProject());

    if (drilldownData && drilldownData.length > 0) {
      this.total = drilldownData[0].total;
      this.cancelled = drilldownData[0].cancelled;
      this.remain = drilldownData[0].remain;
      this.completed = drilldownData[0].completed;
    }
    this.share.getCharts().subscribe((data: any) => {
      const data2: ChartData[] = data as unknown as ChartData[];
      const total: [string, number, string][] = data2.map(item => [item.categoryName, item.total, item.categoryName + ' total']);
      const completed: [string, number][] = data2.map(item => [item.categoryName, item.completed]);
      const contructed: [string, number][] = data2.map(item => [item.categoryName, item.constructed]);
      const equip: [string, number][] = data2.map(item => [item.categoryName, item.equip]);
      const remaining: [string, number][] = data2.map(item => [item.categoryName, item.remaining]);
      const cancelled: [string, number][] = data2.map(item => [item.categoryName, item.cancelled]);


      const totalConstructed = data2.reduce((sum, item) => sum + item.constructed, 0);
      const totalEquip = data2.reduce((sum, item) => sum + item.equip, 0);


      // Tạo mảng theo yêu cầu
      const completed2: [string, number, string][] = [
        ["Hoàn thành nghiệm thu công trình", totalConstructed, "constructed"],
        ["Hoàn thành nghiệm thiết bị", totalEquip, "equip"],

      ];
      const categories2 = completed2.map(([category]) => category);
      const totals2 = completed2.map(([_, total]) => total);
      const labels2 = completed2.map(([_, __, label]) => label);

      const dataAcceptance = categories2.map((category, index) => ({
        name: category,
        y: totals2[index],
        drilldown: labels2[index]
      }));
      const categories = total.map(([category]) => category);
      const totals = total.map(([_, total]) => total);
      const labels = total.map(([_, __, label]) => label);

      const data1 = categories.map((category, index) => ({
        name: category,
        y: totals[index],
        drilldown: labels[index]
      }));
      // console.log(data1);
      interface CategoryData {
        categoryName: string;
        completed: number;
        remaining: number;
        cancelled: number;
        constructed: number;
        equip: number;
        // acceptance: number;
      }

      interface CategoryObjects {
        [key: string]: [string, number][];
      }

      const categoryObjects: CategoryObjects = data.reduce((acc: CategoryObjects, { categoryName, completed, remaining, cancelled, constructed, equip }: CategoryData) => {
        acc[categoryName] = [
          ["Completed", completed],
          ["In Progress", remaining],
          ["Canceled", cancelled],
          ["Acceptance", constructed + equip]

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
                drilldown: 'total',
                color: Colors.TOTAL_PROJECTS
              },
              {
                name: 'In Progress',
                y: this.remain,
                drilldown: 'remaining',
                color: Colors.REMAIN_PROJECTS,
              },
              {
                name: 'Acceptance',
                y: totalConstructed + totalEquip,
                drilldown: 'acceptance',
                color: Colors.ACCEPTANCE_PROJECTS
              },
              {
                name: 'Completed',
                y: this.completed,
                drilldown: 'completed',
                color: Colors.COMPLETED_PROJECTS

              },


              {
                name: 'Canceled',
                y: this.cancelled,
                drilldown: 'cancelled',
                color: Colors.CANCELED_PROJECTS
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
              id: 'constructed',
              data: contructed,
              point: {
                events: {
                  click: (event: any) => {
                    console.log(event.point);
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const id = 'construction';
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, year, id };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'equip',
              data: equip,
              point: {
                events: {
                  click: (event: any) => {
                    // console.log(event.point);
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const id = 'acceptance';
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, year, id };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'acceptance',
              data: dataAcceptance,

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
                    const id = 'completed';
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, year, id };
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
                    console.log(event.point);
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const id = 'remaining';
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, year, id };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'cancelled',
              data: cancelled,
              point: {
                events: {
                  click: (event: any) => {
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const id = 'cancelled';
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, year, id };
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
                    console.log(event.point);
                    const category = data[0].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const id = '4G total';
                    const data2 = { category, color, isCompleted, id };
                    console.log(data2);
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
                    console.log(event.point);
                    const category = data[1].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()
                    const id = 'CCTV total';
                    const data2 = { category, color, isCompleted, id };
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
                    console.log(event.point);
                    const category = data[2].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()
                    const id = 'CORE NETWORK total';
                    const data2 = { category, color, isCompleted, id };
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
                    console.log(event.point);
                    const category = data[3].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    const id = 'DARK FIBER total';

                    const data2 = { category, color, isCompleted, id };
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
                    console.log(event.point);
                    const category = data[4].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()
                    const id = 'ECARD total';
                    const data2 = { category, color, isCompleted, id };
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
                    console.log(event.point);
                    const category = data[5].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()
                    const id = 'INTERNET & LEANSED LINE total';
                    const data2 = { category, color, id, isCompleted };
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
                    console.log(event.point);
                    const category = data[6].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()
                    const id = 'IP PHONE total';
                    const data2 = { category, color, id, isCompleted };
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
                    console.log(event.point);
                    const category = data[7].categoryName; // Lấy tên category khi click
                    const color = event.point.color;
                    const isCompleted = event.point.name;
                    // const year = this.date.value?.year() ?? new Date().getFullYear()
                    const id = 'IP PHONE total';
                    const data2 = { category, id, color, isCompleted };
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
      this.cancelled = drilldownData[0].cancelled;
      this.remain = drilldownData[0].remain;
      this.completed = drilldownData[0].completed;
    }
    this.share.getChartFromTo(val).subscribe((data: any) => {

      const data2: ChartData[] = data as unknown as ChartData[];
      const total: [string, number, string][] = data2.map(item => [item.categoryName, item.total, item.categoryName + ' total']);
      const completed: [string, number][] = data2.map(item => [item.categoryName, item.completed]);
      const remaining: [string, number][] = data2.map(item => [item.categoryName, item.remaining]);
      const cancelled: [string, number][] = data2.map(item => [item.categoryName, item.cancelled]);
      const contructed: [string, number][] = data2.map(item => [item.categoryName, item.constructed]);
      const equip: [string, number][] = data2.map(item => [item.categoryName, item.equip]);

      const totalConstructed = data2.reduce((sum, item) => sum + item.constructed, 0);
      const totalEquip = data2.reduce((sum, item) => sum + item.equip, 0);

      // Tạo mảng theo yêu cầu
      const completed2: [string, number, string][] = [
        ["Hoàn thành nghiệm thu công trình", totalConstructed, "constructed"],
        ["Hoàn thành nghiệm thiết bị", totalEquip, "equip"],

      ];
      const categories2 = completed2.map(([category]) => category);
      const totals2 = completed2.map(([_, total]) => total);
      const labels2 = completed2.map(([_, __, label]) => label);

      const dataAcceptance = categories2.map((category, index) => ({
        name: category,
        y: totals2[index],
        drilldown: labels2[index]
      }));

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
        cancelled: number;
        constructed: number;
        equip: number;
      }

      interface CategoryObjects {
        [key: string]: [string, number][];
      }

      const categoryObjects: CategoryObjects = data.reduce((acc: CategoryObjects, { categoryName, completed, remaining, cancelled, constructed, equip }: CategoryData) => {
        acc[categoryName] = [
          ["Completed", completed],
          ["In Progress", remaining],
          ["Canceled", cancelled],
          ["Acceptance", constructed + equip]
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
                drilldown: 'total',
                color: Colors.TOTAL_PROJECTS
              },
              {
                name: 'In Progress',
                y: this.remain,
                drilldown: 'remaining',
                color: Colors.REMAIN_PROJECTS,
              },
              {
                name: 'Acceptance',
                y: totalConstructed + totalEquip,
                drilldown: 'acceptance',
                color: Colors.ACCEPTANCE_PROJECTS
              },
              {
                name: 'Completed',
                y: this.completed,
                drilldown: 'completed',
                color: Colors.COMPLETED_PROJECTS
              },
              {
                name: 'Canceled',
                y: this.cancelled,
                drilldown: 'cancelled',
                color: Colors.CANCELED_PROJECTS
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
              id: 'constructed',
              data: contructed,
              point: {
                events: {
                  click: (event: any) => {
                    console.log(event.point);
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const id = 'construction';
                    const from = this.fromYear.value?.year();
                    const to = this.toYear.value?.year();
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, from, to, year, id };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'equip',
              data: equip,
              point: {
                events: {
                  click: (event: any) => {
                    console.log(event.point);
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const id = 'acceptance';
                    const from = this.fromYear.value?.year();
                    const to = this.toYear.value?.year();
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color, from, to, year, id };
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'acceptance',
              data: dataAcceptance,

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
                    const id = 'completed';
                    const from = this.fromYear.value?.year();
                    const to = this.toYear.value?.year();
                    const data = { category, color, id, from, to };
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
                    console.log(event.point);
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const from = this.fromYear.value?.year();
                    const to = this.toYear.value?.year();
                    const id = 'remaining';
                    const data = { category, color, id, from, to };
                    console.log(data);
                    this.dataService.changeData(data);
                    this.router.navigate(['/project']);
                  }
                }
              }
            },
            {
              type: 'column',
              id: 'cancelled',
              data: cancelled,
              point: {
                events: {
                  click: (event: any) => {
                    const category = event.point.name; // Lấy tên category khi click
                    const color = event.point.color;
                    const from = this.fromYear.value?.year();
                    const to = this.toYear.value?.year();
                    const id = 'cancelled';
                    const data = { category, color, id, from, to };
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
                    const id = '4G total';
                    const data2 = { category, color, id, isCompleted, from, to };
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
                    const id = 'CCTV total';
                    const data2 = { category, color, id, isCompleted, from, to };
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
                    const id = 'CORE NETWORK total';
                    const data2 = { category, color, id, isCompleted, from, to };
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
                    const id = 'DARK FIBER total';
                    const data2 = { category, color, id, isCompleted, from, to };
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
                    const id = 'ECARD total';
                    const data2 = { category, color, id, isCompleted, from, to };
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
                    const id = 'INTERNET & LEANSED LINE total';

                    const data2 = { category, color, id, isCompleted, from, to };
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
                    const id = 'IP PHONE total';
                    const data2 = { category, color, id, isCompleted, from, to };
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
                    const id = 'IP PHONE total';
                    const data2 = { category, color, id, isCompleted, from, to };
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








