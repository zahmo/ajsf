import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { JsonSchemaFormService, addClasses, inArray } from '@zajsf/core';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';

/**
* DaisyUI framework for Angular JSON Schema Form.
*
*/
@Component({
// tslint:disable-next-line:component-selector
selector: 'daisyui-framework',
templateUrl: './daisyui-framework.component.html',
styleUrls: ['./daisyui-framework.component.scss'],
encapsulation:ViewEncapsulation.None
})
export class DaisyUIFrameworkComponent implements OnInit, OnChanges {
frameworkInitialized = false;
widgetOptions: any; // Options passed to child widget
widgetLayoutNode: any; // layoutNode passed to child widget
options: any; // Options used in this framework
formControl: any = null;
debugOutput: any = '';
debug: any = '';
parentArray: any = null;
isOrderable = false;
@Input() layoutNode: any;
@Input() layoutIndex: number[];
@Input() dataIndex: number[];



DEFAULT_CLASSES={

  // empty:{
  //   fieldHtmlClass:[],
  //   labelHtmlClass:[],
  //   htmlClass:[],
  //   itemLabelHtmlClass:[]
  // },

  '$ref':{
    fieldHtmlClass:['btn','btn-sm','btn-info','pull-right'],//this.options.icon = 'glyphicon glyphicon-plus';
  },
  'alt-date':{
    fieldHtmlClass:['input','input-md','input-bordered', 
    'w-full'],
  },
  'alt-datetime':{
    fieldHtmlClass:['input','input-md','input-bordered', 
    'w-full'],
  },
  array:{},
  authfieldset:{},
  advancedfieldset:{},
  button:{
    fieldHtmlClass:['btn','btn-sm','btn-info']
  },
  checkbox:{
    fieldHtmlClass:['checkbox']
  },
  checkboxes:{
    fieldHtmlClass:['checkbox']
  },
  checkboxbuttons:[
  ],
  'checkboxes-inline':{
    fieldHtmlClass:['checkbox'],
    htmlClass:['inline-flex'],
    itemLabelHtmlClass:['checkbox-inline'],
  },
  'date':{
    fieldHtmlClass:['input','input-md','input-bordered', 
    'w-full'],
  },
  'datetime-local':{
    fieldHtmlClass:['input','input-md','input-bordered', 
  'w-full'],
  },
  fieldset:{},
  integer:{//same as text 
    fieldHtmlClass:['input','input-md','input-bordered',
  'w-full', 'max-w-xs'],
  },
  number:{//same as text 
    fieldHtmlClass:['input','input-md','input-bordered', 
  'w-full', 'max-w-xs'],
  },
  optionfieldset:{},
  password:{
    fieldHtmlClass:['input','input-md','input-bordered', 
  'w-full'],
  },
  radiobuttons:{
    fieldHtmlClass:['w-px'],
    labelHtmlClass:['tabs','tabs-boxed'],
    htmlClass:['btn-group'],
    itemLabelHtmlClass:['btn'],
    activeClass:['btn-info']
  },
  'radios':{
    fieldHtmlClass:['radio']
  },
  'radios-inline':{
    htmlClass:['inline-flex'],
    fieldHtmlClass:['radio'],
    itemLabelHtmlClass:['radio-inline'],
  },
  'range':{
    fieldHtmlClass:['range','range-info']
  },
  section:{},
  selectfieldset:{},
  select:{
    fieldHtmlClass:['select','select-md','select-bordered','w-full']
  },
  submit:{
    fieldHtmlClass:['btn','btn-sm','btn-info','rounded-full'],//this.options.style || 'btn-info'
  },
  text:{
    fieldHtmlClass:['input','input-md','input-bordered', 
  'w-full'],
  }, 
  tabs:{//same as tabarray
    labelHtmlClass:['tabs','tabs-boxed'],
    htmlClass:[],
    itemLabelHtmlClass:['tab'],
    activeClass:['tab-active']
  },
  tabarray:{
    labelHtmlClass:['tabs','tabs-boxed'],
    htmlClass:[],
    itemLabelHtmlClass:['tab'],
    activeClass:['tab-active']
  },
  textarea:{
    fieldHtmlClass:['textarea', 'textarea-bordered','w-full'],
  },
  default:{
    fieldHtmlClass:['form-control']
  },

}

//TODO-move to zajsf/core utility.functions.ts
applyCssClasses(type,widgetOptions,styleOptions){
  //console.log("applyCssClasses for type:"+type);
  let cssClasses=this.DEFAULT_CLASSES[type];
  if(!cssClasses){
    cssClasses=this.DEFAULT_CLASSES.default;
  }
  Object.keys(cssClasses).forEach(catName=>{
    let classList=cssClasses[catName];

    if(classList.length){
      widgetOptions[catName]=addClasses(widgetOptions[catName],classList);
    }
    if(styleOptions){
      widgetOptions[catName]=addClasses(widgetOptions[catName],styleOptions);
    }
    
  })
}


constructor(
  public changeDetector: ChangeDetectorRef,
  public jsf: JsonSchemaFormService
) {
}

get showRemoveButton(): boolean {
  if (!this.options.removable || this.options.readonly ||
    this.layoutNode.type === '$ref'
  ) {
    return false;
  }
  if (this.layoutNode.recursiveReference) {
    return true;
  }
  if (!this.layoutNode.arrayItem || !this.parentArray) {
    return false;
  }
  // If array length <= minItems, don't allow removing any items
  return this.parentArray.items.length - 1 <= this.parentArray.options.minItems ? false :
    // For removable list items, allow removing any item
    this.layoutNode.arrayItemType === 'list' ? true :
      // For removable tuple items, only allow removing last item in list
      this.layoutIndex[this.layoutIndex.length - 1] === this.parentArray.items.length - 2;
}

ngOnInit() {
  this.initializeFramework();
  if (this.layoutNode.arrayItem && this.layoutNode.type !== '$ref') {
    this.parentArray = this.jsf.getParentNode(this);
    if (this.parentArray) {
      this.isOrderable = this.layoutNode.arrayItemType === 'list' &&
        !this.options.readonly && this.parentArray.options.orderable;
    }
  }
}

ngOnChanges() {
  if (!this.frameworkInitialized) {
    this.initializeFramework();
  }
}

initializeFramework() {
  if (this.layoutNode) {
    this.options = cloneDeep(this.layoutNode.options);
    this.widgetLayoutNode = {
      ...this.layoutNode,
      options: cloneDeep(this.layoutNode.options)
    };
    this.widgetOptions = this.widgetLayoutNode.options;
    this.formControl = this.jsf.getFormControl(this);

    this.options.isInputWidget = inArray(this.layoutNode.type, [
      'button', 'checkbox', 'checkboxes-inline', 'checkboxes', 'color',
      'date', 'datetime-local', 'datetime', 'email', 'file', 'hidden',
      'image', 'integer', 'month', 'number', 'password', 'radio',
      'radiobuttons', 'radios-inline', 'radios', 'range', 'reset', 'search',
      'select', 'submit', 'tel', 'text', 'textarea', 'time', 'url', 'week'
    ]);

    this.options.title = this.setTitle();

    this.options.htmlClass =
      addClasses(this.options.htmlClass, 'schema-form-' + this.layoutNode.type);
    

    this.options.htmlClass =
      this.layoutNode.type === 'array' ?
        addClasses(this.options.htmlClass, ['border','shadow-md','p-1']) :
        this.layoutNode.arrayItem && this.layoutNode.type !== '$ref' ?
          addClasses(this.options.htmlClass, ['border','shadow-md','p-1']) :
          addClasses(this.options.htmlClass, 'mb-1');

    this.widgetOptions.htmlClass = '';
    this.options.labelHtmlClass =
      addClasses(this.options.labelHtmlClass, 'control-label');
    this.widgetOptions.activeClass =
      addClasses(this.widgetOptions.activeClass, 'active');
    this.options.fieldAddonLeft =
      this.options.fieldAddonLeft || this.options.prepend;
    this.options.fieldAddonRight =
      this.options.fieldAddonRight || this.options.append;

    // Add asterisk to titles if required
    if (this.options.title && this.layoutNode.type !== 'tab' &&
      !this.options.notitle && this.options.required &&
      !this.options.title.includes('*')
    ) {
      this.options.title += ' <strong class="text-danger">*</strong>';
    }
    if(this.layoutNode.type=='optionfieldset'){
      this.options.messageLocation = 'top';
    }
    // Set miscelaneous styles and settings for each control type
    this.applyCssClasses(this.layoutNode.type,this.widgetOptions,this.options.style);
    if (this.formControl) {
      this.updateHelpBlock(this.formControl.status);
      this.formControl.statusChanges.subscribe(status => this.updateHelpBlock(status));

      if (this.options.debug) {
        const vars: any[] = [];
        this.debugOutput = map(vars, thisVar => JSON.stringify(thisVar, null, 2)).join('\n');
      }
    }
    this.frameworkInitialized = true;
  }

}

updateHelpBlock(status) {
  this.options.helpBlock = status === 'INVALID' &&
  this.options.enableErrorState && this.formControl.errors &&
  (this.formControl.dirty || this.options.feedbackOnRender) ?
    this.jsf.formatErrors(this.formControl.errors, this.options.validationMessages) :
    this.options.description || this.options.help || null;
}

setTitle(): string {
  switch (this.layoutNode.type) {
    case 'button':
    case 'checkbox':
    case 'section':
    case 'help':
    case 'msg':
    case 'submit':
    case 'message':
    case 'tabarray':
    case 'tabs':
    case '$ref':
      return null;
    case 'advancedfieldset':
      this.widgetOptions.expandable = true;
      this.widgetOptions.title = 'Advanced options';
      return null;
    case 'authfieldset':
      this.widgetOptions.expandable = true;
      this.widgetOptions.title = 'Authentication settings';
      return null;
    case 'fieldset':
      this.widgetOptions.title = this.options.title;
      return null;
    default:
      this.widgetOptions.title = null;
      return this.jsf.setItemTitle(this);
  }
}

removeItem() {
  this.jsf.removeItem(this);
}
}
