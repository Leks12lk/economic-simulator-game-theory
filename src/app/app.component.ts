import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

export interface IMatrixElement {
  'x': number;
  'y': number;
  'value': number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentDate = new Date();
  showSettings = false;

  initialData = {
    'companyA': {
      'annualProfit': 5,
      'advertiseCost': 2,
      'advertiseEffect': 3
    },
    'companyB': {
      'annualProfit': 5,
      'advertiseCost': 2,
      'advertiseEffect': 3
    }
  };

  A_Matrix = [];
  B_Matrix = [];

  A_MatrixdataSource = [];
  B_MatrixdataSource = [];

  inputData = null;

  inputDataForm: FormGroup;

  playerAStep: boolean;
  playerBStep: boolean;

  playerAProfit: number;
  playerBProfit: number;

  accumulativeAProfit = 0;
  accumulativeBProfit = 0;

  hintMessage = "";
  showHintFlag = false;

  multipleGamesCount = null;

  get A_StepText(): string {
    return this.playerAStep ? 'Інвестували' : 'Не інвестували';
  }

  get B_StepText(): string {
    return this.playerBStep ? 'Інвестувала' : 'Не інвестувала';
  }

  constructor(private fb: FormBuilder, private _snackBar: MatSnackBar) {

  }

  ngOnInit(): void {
    this.inputDataForm = this.fb.group({
      companyA: this.fb.group({
        annualProfit: [this.initialData.companyA.annualProfit, [Validators.required, Validators.min(0)]],
        advertiseCost: [this.initialData.companyA.advertiseCost, [Validators.required, Validators.min(0)]],
        advertiseEffect: [this.initialData.companyA.advertiseEffect, [Validators.required, Validators.min(0)]]
      }),
      companyB: this.fb.group({
        annualProfit: [this.initialData.companyB.annualProfit, [Validators.required, Validators.min(0)]],
        advertiseCost: [this.initialData.companyB.advertiseCost, [Validators.required, Validators.min(0)]],
        advertiseEffect: [this.initialData.companyB.advertiseEffect, [Validators.required, Validators.min(0)]]
      })
    });

    this.inputData = this.initialData;
    this.setMatrixes();
    this.A_MatrixdataSource = this.getMatrixDataSource();
    this.B_MatrixdataSource = this.getMatrixDataSource();
  }

  public saveInputData() {
    if (!this.inputDataForm.valid) {
      return;
    }

    this.inputData = this.inputDataForm.value;
    this.setMatrixes();
    this.showSettings = false;
  }



  displayedColumns: string[] = ['actionTitle', 'profit_column1', 'profit_column2'];
  A_columns: any[] = [
    {
      key: 'actionTitle',
      title: 'Матриця компанії А',
      text: (rowIndex: number) => {
        if (rowIndex === 0) {
          return 'Інвестує в рекламу';
        }

        if (rowIndex === 1) {
          return 'Не інвестує в рекламу';
        }

        return rowIndex.toString();
      }
    },
    {
      key: 'profit_column1',
      title: 'Компанія В інвестує в рекламу',
      cell: (x: number, y: number) => {
        return this.A_Matrix.find(el => el.x === x && el.y === y).value;
      }
    },
    {
      key: 'profit_column2',
      title: 'Компанія В не інвестує в рекламу',
      cell: (x: number, y: number) => {
        return this.A_Matrix.find(el => el.x === x && el.y === y).value;
      }

    }
  ];
  B_columns: any[] = [
    {
      key: 'actionTitle',
      title: 'Матриця компанії B',
      text: (rowIndex: number) => {
        if (rowIndex === 0) {
          return 'Інвестує в рекламу';
        }

        if (rowIndex === 1) {
          return 'Не інвестує в рекламу';
        }

        return rowIndex.toString();
      }
    },
    {
      key: 'profit_column1',
      title: 'Компанія A інвестує в рекламу',
      cell: (x: number, y: number) => {
        return this.B_Matrix.find(el => el.x === x && el.y === y).value;
      }

    },
    {
      key: 'profit_column2',
      title: 'Компанія A не інвестує в рекламу',
      cell: (x: number, y: number) => {
        return this.B_Matrix.find(el => el.x === x && el.y === y).value;
      }

    }
  ];


  public play(toInvest: boolean) {
    if (!this.multipleGamesCount) {
      const message = this.playIteration(toInvest);
      this._snackBar.open(message, null, {
        duration: 2000,
      });
      return;
    }

    const gamesCount = +this.multipleGamesCount;
    for (let i = 0; i < gamesCount; i++) {
      this.playIteration(toInvest)
    }

  }

  private playIteration(toInvest: boolean): string {
    this.playerAStep = toInvest;

    this.playerBStep = Math.random() <= 0.5;

    const matrixRow = toInvest ? 1 : 2;
    const matrixColumn = this.playerBStep ? 1 : 2;

    const playerAProfit = this.A_Matrix.find(el => el.x === matrixRow && el.y === matrixColumn);
    this.playerAProfit = playerAProfit.value;
    this.accumulativeAProfit += this.playerAProfit ? this.playerAProfit : 0;

    const playerBProfit = this.B_Matrix.find(el => el.x === matrixRow && el.y === matrixColumn);
    this.playerBProfit = playerBProfit.value;
    this.accumulativeBProfit += this.playerBProfit ? this.playerBProfit : 0;

    let message = "Ви заробили стільки ж, скільки і конкурент."
    if (this.playerAProfit > this.playerBProfit) {
      message = "Вітаємо! Ви перемогли!";
    }
    if (this.playerAProfit < this.playerBProfit) {
      message = "На жаль, Ви програли.";
    }

    return message;
  }

  public showHint() {
    if (this.showHintFlag) {
      this.showHintFlag = !this.showHintFlag;
      return;
    }

    const element = this.getPlayerAOptimalElement();
    this.hintMessage = `
      Для Вас як для менеджера компанії А оптимальною стратегією буде вчиняти дію, що відповідає рядку номер ${element.x} з таблиці 'Матриця компанї А'.
      Ваш прибуток в цьому разі складе щонайменше ${element.value} млн. грн.
      `;
    this.showHintFlag = true;
  }

  private getPlayerAOptimalElement(): IMatrixElement {
    // find min in rows in A
    let values = [];
    let minValues = [];
    for (let i = 1; i <= 100; i++) {
      const rows = this.A_Matrix.filter(el => el.x === i);
      console.log(rows);
      if (!rows || rows.length === 0) {
        break;
      }


      // rows.forEach(element => {
      //   values.push(element.value);
      // });

      const mins = rows.reduce(function (prev, curr) {
        return prev.value < curr.value ? prev : curr;
      });

      minValues = minValues.concat(mins);


      // const minValue = Math.min(...values);
      // minValues.push(minValue);
    }
    console.log('values', values);
    //console.log('minValues', minValues);
    // find max between mins
    // const maxValue = Math.max(...minValues);

    const max = minValues.reduce(function (prev, curr) {
      return prev.value > curr.value ? prev : curr;
    });


    console.log('max', max);
    return max;

    // const minValue = Math.max(...)

  }

  private getMatrixDataSource(): any {
    return [
      { actionTitle: 'Рекламувати', x: 1, y1: 1, y2: 2 },
      { actionTitle: 'Не рекламувати', x: 2, y1: 1, y2: 2 }
    ];
  }

  private setMatrixes(): void {
    const companyA = this.inputData.companyA;
    this.A_Matrix = [
      { x: 1, y: 1, value: companyA.annualProfit - companyA.advertiseCost },
      { x: 1, y: 2, value: companyA.annualProfit - companyA.advertiseCost + companyA.advertiseEffect },
      { x: 2, y: 1, value: companyA.annualProfit - companyA.advertiseEffect },
      { x: 2, y: 2, value: companyA.annualProfit }
    ];

    const companyB = this.inputData.companyB;
    this.B_Matrix = [
      { x: 1, y: 1, value: companyB.annualProfit - companyB.advertiseCost },
      { x: 1, y: 2, value: companyB.annualProfit - companyB.advertiseEffect },
      { x: 2, y: 1, value: companyB.annualProfit - companyB.advertiseCost + companyB.advertiseEffect },
      { x: 2, y: 2, value: companyB.annualProfit }
    ];
  }


}
