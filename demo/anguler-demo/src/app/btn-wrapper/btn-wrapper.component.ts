import { Component,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-btn-wrapper',
  standalone: true,
  imports: [],
  templateUrl: './btn-wrapper.component.html',
  styleUrl: './btn-wrapper.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class BtnWrapperComponent {

  public selectedSize:string="md"

  onButtonClick(e:Event){
    console.log(e)
  }

  onSizeChange(e:Event){
    this.selectedSize=(e!.target as HTMLInputElement).value
  }

}
