import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test2',
  imports:[CommonModule],
  templateUrl: './test2.html',
  styleUrl: './test2.css',
})
export class Test2 {
  inputValue: string = '0';
  operator: string | null = null;
  operand1: number | null = null;
  result: number | null = null;
  maxLength: number = 10;
  tenten: string = '.' ;
  stopper: string | null = null;
    
  //【OK】表示
  get displayValue(): string {
    if (this.inputValue !== '') return this.inputValue;//入力が一番
    if (this.operand1 !== null){//次に保存数字
      return this.toPlainDecimal(this.operand1);
    }//指数変換関数を通す
    return '0';
  }
  //【OK】指数表記を変換
  toPlainDecimal(num: number): string {
    const str = num.toString();
    if (!/[eE]/.test(str)) return str;//指数がなければそのまま返す

    const [mantissa, exponentPart] = str.split(/[eE]/);
    const exponent = parseInt(exponentPart, 10);//べき乗の分離と変換

    let [intPart, fracPart = ""] = mantissa.split(".");
    const isNegative = intPart.startsWith("-");

    if (isNegative) intPart = intPart.slice(1);//マイナスの分離

    const digits = intPart + fracPart;

    let result: string;

    if (exponent >= 0) {//0をいくつつけるのか
      const zeros = exponent - fracPart.length;
      result = zeros >= 0
      ? digits + "0".repeat(zeros)
      : digits.slice(0, intPart.length + exponent) +
        "." +
        digits.slice(intPart.length + exponent);
    } else {
      const zeros = Math.abs(exponent) - intPart.length;
      result = zeros >= 0
      ? "0." + "0".repeat(zeros) + digits
      : digits.slice(0, intPart.length + exponent) +
        "." +
        digits.slice(intPart.length + exponent);
    }

    return isNegative ? "-" + result : result;
  }
  //【OK】電卓上に常にある小数点表記
  syousu(): void {
    if(this.inputValue.includes('.')){//入力に小数点があれば排除
      this.tenten = '' ;
    } else { //入力に小数点がない場合はつける
      this.tenten = '.'
    }
    if(this.inputValue === '' && this.operand1 !== null){//入力がなし保存がある場合
      if(this.displayValue.includes('.')){//表記されているものに小数点があればつけない
        this.tenten = ''
      } else {//表記されているものになければつける
        this.tenten = '.'
      }
    }
  }
  //【OK】数値入力
  addNumber (value: string):void{
   if(this.stopper === 'E') return;//Eの時は操作なし
    if(this.operator === null && this.operand1 !== null && this.result !== null){//compute後の状態で第一打が数値の場合
    this.operator = null;
    this.operand1 = null;
    this.result = null;
      if(value === '.'){
        this.inputValue = '0.'
        this.syousu()
      }
    }//入力以外をリセット
    if (value === '.' && this.inputValue.includes('.')){
      return;
    }//小数点2つ目は無視
    
    if (this.inputValue === '0' && value !== '.'){
      this.inputValue = '';
    }//小数点以外であれば最初の0を消す

    if (this.inputValue === '' && value === '.'){
      this.inputValue = '0'
    }//compute後の第1打が小数点の場合は0を追加
    
    if (this.inputValue.includes('.')){//小数点がある場合は
      if (this.inputValue.split('.')[1].length < 8 && this.inputValue.replace('-','').replace('.','').length < this.maxLength){
        this.inputValue += value;//小数が第8位までかつ全部で10桁以下であれば入力
      }
    } else {//小数点なしの場合
      if (this.inputValue.replace('-','').length < this.maxLength){
        this.inputValue += value;//10億の桁までは入力
      }
    }
    this.syousu()
  }
  //【OK】記号入力+連続入力時に前までの計算
  setOperator (op: string): void {
    if (this.inputValue){ //入力あり
      const currentValue = this.safeParse(this.inputValue);

      if (this.operand1 === null){
        if (this.operator){//最初に計算記号、数値を入力しての＝の場合
          this.result = this.limitDigits(this.compute(0, currentValue, this.operator))
        }
        this.operand1 = currentValue;
      } 
      else if (this.operator){//保存１があり、opeもある場合は計算する
        this.result = this.limitDigits(this.compute(this.operand1, currentValue, this.operator));
        this.operand1 = this.result;//計算結果を保存１へ。
      }
    }
    this.operator = op;//operatorの上書き保存
    this.inputValue = '';//入力値の削除
    this.syousu()
  }
  //【OK】計算
  calculate(): void {// operand1 と operator がセットされていて、inputValue があるときだけ計算
     if (this.operand1 !== null && this.operator && this.inputValue !== '') {
      const currentValue = this.safeParse(this.inputValue);
      this.result = this.limitDigits(this.compute(this.operand1, currentValue, this.operator)); // 共通計算関数を使って計算
      this.operand1 = this.result; // 計算結果を次の計算用に operand1 にセット
      // 入力値と演算子はリセット
      this.inputValue = '';
      this.operator = null;
    }
    this.syousu()
  }
  //【OK】文字列から数値+小数第8位まで
  safeParse(val: string): number {
    const [i, d = ''] = val.split('.');
    const fixed = d.slice(0, 8);
    return Number(i + '.' + fixed);
  }
  //【OK】共通計算関数
  compute(x: number, y: number, op: string): number {
    const factor = 1e8; // 小数第8位まで
    const a = x * factor;
    const b = y * factor;

    let result: number;
    switch (op) {
      case '+': result = (a + b) / factor; break;
      case '-': result = (a - b) / factor; break;
      case '×': {
        const a1 = BigInt(Math.round(x * factor));
        const b1 = BigInt(Math.round(y * factor));
        result = Number(a1 * b1 / BigInt(factor)) / factor; break;
      }
      case '÷': 
        if (y === 0) { this.stopper = 'E'; return 0; }
        result = (a / b); break;
      default: result = y;
    }
  return result;
  }
  //【OK】クリア
  clear() :void {
    this.stopper = null
    this.inputValue = '0';
    this.operator = null;
    this.operand1 = null;
    this.result = null;
    this.syousu();
  }
  //【OK】直前クリア
  clearE() :void{
    if(this.operand1 !== null && this.inputValue !== ''){
      this.inputValue = '0';
    } 
    if(this.operand1 !== null && this.inputValue === ''){
      this.inputValue = '';
    } 
    if(this.operand1 === null && this.inputValue){
      this.inputValue = '0';
    }
    this.syousu();
  }
  //【OK】正負記号の追加
  toggleNegative() :void{
   if(this.stopper === 'E') return;
    if(this.inputValue !== '' && this.inputValue !== '0'){//入力値がある場合
      if(this.inputValue.startsWith('-')){
        this.inputValue = this.inputValue.slice(1);
      } else {
        this.inputValue = '-' + this.inputValue
      }
    }
    if(this.inputValue === '' && this.operand1 !== null){
        this.operand1 = -1 * this.operand1
      }//入力値なしでも保存１があれば(compute後)マイナス
    
  }
  //【OK】有効数字(切り捨て)10桁＋100億以上のstopper
  limitDigits(value: number): number {
    const str = value.toFixed(10);
    const [intPart, decimalPart] = str.split('.');

    if (intPart.replace('-','').length >= 11) {//11桁を超えたらstopperを作動
      this.stopper = 'E';
    }

    if (intPart.includes('-')){//マイナスの文字数ケア+10桁までの表記
      if (intPart.length >= 11) {
      return Number(intPart.slice(0, 11));
      }
    } else {
        if (intPart.length >= 10){
          return Number(intPart.slice(0, 10));
        }
      }
    
    if (intPart.length === 1){//小数が9桁以上の時は
      const remaining2 = 9 - intPart.length;
      const decimal2 = decimalPart ? decimalPart.slice(0, remaining2) : '';

      return Number(decimal2 ? `${intPart}.${decimal2}` : intPart);
    }

    const remaining = 10 - intPart.length;
    const decimal = decimalPart ? decimalPart.slice(0, remaining) : '';

  return Number(decimal ? `${intPart}.${decimal}` : intPart);//整数＋小数で戻す
}

}
