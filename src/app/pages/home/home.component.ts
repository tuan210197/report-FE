import { Component, OnInit, } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { firstValueFrom } from 'rxjs';
import Drilldown from 'highcharts/modules/drilldown';
import { ShareService } from '../../services/share.service';
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
  imports: [HighchartsChartModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; // Gắn Highcharts vào biến toàn cục
  chartOptions: Highcharts.Options = {}; // Cấu hình biểu đồ

  total: number = 0;
  news: number = 0;
  remain: number = 0;
  completed: number = 0;
  constructor(
    private share: ShareService,
    private authService: AuthService
  ) { }
  ngOnInit(): void {
    this.loadChartData();
  }

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
      const total: [string, number][] = data2.map(item => [item.categoryName, item.total]);
      const completed: [string, number][] = data2.map(item => [item.categoryName, item.completed]);
      const remaining: [string, number][] = data2.map(item => [item.categoryName, item.remaining]);
      const news: [string, number][] = data2.map(item => [item.categoryName, item.news]);
      console.log(this.total);
      console.log(this.completed);
      console.log(this.remain);
      console.log(this.news);
      this.chartOptions = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'PROJECT MANAGEMENT'
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
            point: {
              events: {
                click: function () {
                  let drilldownData: Array<[string, number]> = []; // Khai báo kiểu rõ ràng
                  if (this.name === 'Total Projects') {
                    drilldownData = total;

                  } else if (this.name === 'Completed') {
                    drilldownData = completed;
                  } else if (this.name === 'Remaining') {
                    drilldownData = remaining;
                  } else if (this.name === 'New project') {
                    drilldownData = news;
                  }
                  this.series.chart.addSeriesAsDrilldown(this, {
                    type: 'column', // Quan trọng: Xác định type cho drilldown series
                    name: this.name,
                    id: this.name.toLowerCase(),
                    data: drilldownData
                  });
                }
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
                drilldown: 'completed'
              },
              {
                name: 'Remaining',
                y: this.remain,
                drilldown: 'remaining'
              },
              {
                name: 'New project',
                y: this.news,
                drilldown: 'new'
              }
            ]
          }
        ],
        drilldown: {
          series: [] // Không cần thêm series ở đây; chúng được thêm động trong sự kiện click
        },
        credits: {
          enabled: true
        }
      };
      Highcharts.chart('container', this.chartOptions);
    });
  };


}








