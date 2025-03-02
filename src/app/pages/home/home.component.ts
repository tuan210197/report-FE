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
  constructor(
    private share: ShareService, private router: Router, private dataService: DataService
  ) { }
  translateService = inject(AppTranslateService);

  readonly date = new FormControl(moment());

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {

    const ctrlValue = this.date.value!;
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue); // Lưu năm
    datepicker.close();
    this.loadChartData(this.date.value?.year() ?? new Date().getFullYear());
  }

  ngOnInit(): void {
    const year = new Date().getFullYear();
    this.loadChartData(year);

  }

  async loadChartData(data: number) {
    let val = data;

    const drilldownData: any = await firstValueFrom(this.share.getCompletedProject(val));
    if (drilldownData && drilldownData.length > 0) {
      this.total = drilldownData[0].total;
      this.news = drilldownData[0].news;
      this.remain = drilldownData[0].remain;
      this.completed = drilldownData[0].completed;
    }
    this.share.getCharts(val).subscribe((data: any) => {

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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
                    const data = { category, color,year };
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
                    const data = { category, color,year };
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
                    const data = { category, color,year };
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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
           
                    const data2 = { category, color, isCompleted,year };
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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
           
                    const data2 = { category, color, isCompleted,year };
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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
           
                    const data2 = { category, color, isCompleted,year };
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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
           
                    const data2 = { category, color, isCompleted,year };
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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
           
                    const data2 = { category, color, isCompleted,year };
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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
           
                    const data2 = { category, color, isCompleted,year };
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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
           
                    const data2 = { category, color, isCompleted,year };
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
                    const year = this.date.value?.year() ?? new Date().getFullYear()
           
                    const data2 = { category, color, isCompleted,year };                    
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








