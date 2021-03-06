import { Component,OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HolidayProvider } from '../../providers/holiday/holiday';
import { CommonFunctionComponent } from '../../commons/CommonFunctionComponent';
import { Message, LazyLoadEvent } from 'primeng/primeng';
import { Holiday } from '../../models/Holiday';
import { DropdownOptions } from '../../commons/auto-complete-dropdown/DropdownOptions';
import { ParameterTableDetail } from '../../models/parameter-table-detail-model';



@IonicPage()
@Component({
  selector: 'page-holiday',
  templateUrl: 'holiday.html',
})
export class HolidayPage {

  @ViewChild("autoCompleteDropdownPosition") autoCompleteDropdownPosition: any;

  commonFnComp: CommonFunctionComponent = new CommonFunctionComponent();
  holidayform: FormGroup;
  msgs: Message[] = [];
  isModify: boolean = false;
  btnLabel: string = "บันทึก";


  holiday: Holiday[];  
  totalRecords: number;
  selectedholiday: Holiday[];
  stacked: boolean;
  

  //set Button_control
  Button_Add: string;
  Button_Edit: string;
  Button_Remove: string;
  Button_Plint: string;

  th: any;
  currentDate: Date;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private holidayProvider: HolidayProvider,
    private alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController
  ) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HolidayPage');
    this.ngOnInit();
  }

  ngOnInit() {

    //set Button_control
    this.Button_Add     = localStorage.getItem('Btnadd');
    this.Button_Edit    = localStorage.getItem('Btnedit');
    this.Button_Remove  = localStorage.getItem('Btnremove');

    this.currentDate = new Date();
    this.th = {
      firstDayOfWeek: 0,
      dayNames: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"],
      dayNamesShort: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
      dayNamesMin: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
      monthNames: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
      monthNamesShort: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
      today: 'Today',
      clear: 'Clear'
    };

    this.holidayform = this.formBuilder.group({
      'holidayId': new FormControl(''),
      'holidayDate': new FormControl(new Date,Validators.required),
      'referenceHoliday': new FormControl('',Validators.required),
      'description': new FormControl('', Validators.required),
      'activeFlag': new FormControl()
    });

    this.autoCompleteDropdownPosition.dropdownOptions = new DropdownOptions<ParameterTableDetail>(
      "/api/Holiday/referenceHoliday"
      , "TABLE_HOLIDAY"
      , "description"
      , "Name Holiday"
      , this.holidayform
      , "referenceHoliday"
      , new FormControl('', Validators.required)
    )

  }

  

  loadLazy(event: LazyLoadEvent) {
    this.holidayProvider.loadlLazy(event).then(result => {
      this.holiday = result.listOfData;
      console.log(result);
      this.totalRecords = result.totalRecords;
    });

  }

  onReload() {
    this.holidayProvider.loadAll().then(result => {
      this.holiday = result;
      console.log(result);
    })

    this.ngOnInit();
  }

  onSubmit(value: Holiday) {
    console.log(value);
    this.msgs = [];
    this.holidayProvider.saveOrUpdate(value, this.isModify).then(result => {
      console.log(result);
      this.onResetForm();
      this.msgs.push(result);
      this.isModify = false;
      this.btnLabel = "บันทึก";
      this.onReload();
    }),
      errors => {
        let error = errors.json();
        console.log(error);
        this.msgs.push(error);
        this.onReload();
      }
  }

  onResetForm() {
    this.holidayform.reset({});
  }

  onRemove() {
    let component: HolidayPage = this;
    this.commonFnComp.ConfirmDialog(component, this.alertCtrl,
      function () {
        component.holidayProvider.onRemove(component.selectedholiday)
          .then(
          result => {
            component.selectedholiday = [];
            component.msgs.push({ severity: 'success', summary: 'Success', detail: 'Successfully' });
            component.onReload();
          },
          errors => {
            let error = errors.json();
            component.msgs.push({ severity: 'error', summary: 'Error', detail: error.msg })
          }
          );
      },
      null
    );
  
  }

  select(holiday: Holiday) {
    holiday.holidayDate = holiday.holidayDate? new Date(holiday.holidayDate) : null;
    console.log("Holiday", holiday);
    (<FormGroup>this.holidayform).reset(holiday, { onlySelf: true });

    this.isModify = true;
    this.btnLabel = "แก้ไข";

  }

  cancleUpdate() {
    this.onResetForm();
    this.isModify = false;
    this.btnLabel = "บันทึก";
  }

  coppyHoliday(){

    let modal  = this.modalCtrl.create('HolidayCoppyPage');
    modal.present();
  }

}
