###ImageBrowser

1. Most changes in the ImageBrowser project are summarized here.  Some of the details also appear below under the heading for each source file.

2. DlgMediaProcessingOptions.pas and ExifInspection.pas were modified to support PSetting in the uses list.

3. ImageBrowserPanel.pas, ImageWorks.pas, ObjArcGisThumbnails.pas have the LeadTools libraries updated to 14.5 to support the thumbnails in the panel.

4. Images.res hosts the icon that is to be displayed on the ArcMap TOC banner. It was added for the 10.x ContentsView3 interface.

5. ObjMetaObject.pas was modified to avoid the problem with the missing RhHtml source.  The RHHtmlMatch_tlb has a completely stubbed implementation.  The RHHtmlMatch methods could probably be implemented to emit html code by comparing the stubs with the other meta object implementations.  As a guide, the ArcMap 9.3 could be run, exercising the RhImageBrowser GUI to generate an html export.  The html in the exported file might be quite simple, and the html generation code could be added to the stubbed methods in RHHtmlMatch.

    I lost track of what was involved in IRhGeoRec, and substituted the IRHHtml interface as a place-holder.


6. The project file (.dpr) was changed to inject the 14.5 LeadTools unlocking mechanism:

+  LTLckKey in '..\..\..\..\..\..\..\Program Files\LEAD Technologies\LEADTOOLS 14.5\Uses\LTLckKey.pas',

7. If you move the ImageBrowser project in the source code tree, this reference might be invalidated.

8. RhImageBrowserImpl.pas was modified to implement the IContentsView3 interface, which in turn inherits from IContentsView2.

    The Get_Bitmap method was implemented by lifting a method from one of the destination selection dialogs, with the LoadFromFile changed to LoadFromResourceName to get the SHOWIMGBROWSE icon from a compiled resource, instead of from an invalid ArcMap path.

9. UnlockLeadtools.pas was upgraded to use LeadTools 14.5 from LeadTools 13.

####DlgMediaProcessingOptions.pas
Support PSetting in the uses list.
```

    diff('*.diff', '*.patch')

    diff -r dc4b2d236808 -r e4ba0a3e597c DlgMediaProcessingOptions.pas
    --- a/DlgMediaProcessingOptions.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/DlgMediaProcessingOptions.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -4,6 +4,7 @@
     
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
    +  //dmActions, ComCtrls, StdCtrls, ExtCtrls, Buttons, Menus, jpeg,
       dmActions, ComCtrls, PSetting, StdCtrls, ExtCtrls, Buttons, Menus, jpeg,
       ObjGmlOptions, ObjAnnotationTemplate;
```     
####ExifInspection.pas
support PSetting in the uses list.
```

diff('*.diff', '*.patch')       
 
    diff -r dc4b2d236808 -r e4ba0a3e597c ExifInspection.pas
    --- a/ExifInspection.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/ExifInspection.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -18,6 +18,7 @@
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
       ComCtrls, dmActions, PSetting;
    +  //ComCtrls, dmActions, PSetting;
     
     type
       TExifInspect = class(TForm)
```
####ImageBrowserPanel.pas
LeadTools libraries updated to 14.5 to support the thumbnails in the panel.
```
    diff('*.diff', '*.patch')
    
    diff -r dc4b2d236808 -r e4ba0a3e597c ImageBrowserPanel.pas
    --- a/ImageBrowserPanel.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/ImageBrowserPanel.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -17,7 +17,7 @@
     
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs, StdCtrls,
    -  extctrls, ImLstVCL, ThumbVCL, LEADVCL, ltvcltyp, ltvcldef, ObjArcGisThumbnails,
    +  extctrls, LEADThmb, LeadDef, LEADTyp, LEADMain, LEADUnt, LEADImgLst, ObjArcGisThumbnails,
       {$IFDEF ARCMAP9}RhImageBrowser_TLB,{$ELSE}RhImageBrowser8_TLB,{$ENDIF} esriCoreEvents,
       ImageBrowserLayerList, ActiveX, ObjTempFileManagement,
       GMLArcMapToolBar_TLB, RHPixPoint_TLB, RhViewer_TLB, ToolWin, ComCtrls, Menus, Mask,
       
```
####ImageWorks.pas
LeadTools libraries updated to 14.5 to support the thumbnails in the panel.
```

    diff('*.diff', '*.patch')
    diff -r dc4b2d236808 -r e4ba0a3e597c ImageWorks.pas
    --- a/ImageWorks.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/ImageWorks.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -25,7 +25,7 @@
     }
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Dialogs,
    -  ltvcltyp, ExtCtrls, LEADVCL, StdCtrls, DlgVcl, LEADDef;
    +  LeadDef, LEADMain, LEADTyp, ExtCtrls, StdCtrls;
     
     type
       TImageConverter = class(TComponent)
       
```    

####Images.res   
Hosts the icon that is to be displayed on the ArcMap TOC banner. It was added for the 10.x ContentsView3 interface.

```
    diff('*.diff', '*.patch')
    diff -r dc4b2d236808 -r e4ba0a3e597c Images.res
    Binary file Images.res has changed
    
```

####ObjArcGisThumbnails.pas
LeadTools libraries updated to 14.5 to support the thumbnails in the panel.


    diff('*.diff', '*.patch')
    diff -r dc4b2d236808 -r e4ba0a3e597c ObjArcGisThumbnails.pas
    --- a/ObjArcGisThumbnails.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/ObjArcGisThumbnails.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -17,7 +17,7 @@
     
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
    -  ImLstVCL, ThumbVCL, LEADVCL, ltvcltyp, ltvcldef;
    +  LeadDef, LEADTyp, LEADMain, LEADThmb, LEADUnt;
     
     type
     

####ObjMetaObject.pas
Available source libraries are missing RhHtml source.  The RHHtmlMatch_tlb has a completely stubbed implementation.  The RHHtmlMatch methods could probably be implemented to emit html code by comparing the stubs with the other meta object implementations.  As a guide, the ArcMap 9.3 could be run, exercising the RhImageBrowser GUI to generate an html export.  The html in the exported file might be quite simple, and the html generation code could be added to the stubbed methods in RHHtmlMatch.

I lost track of what was involved in IRhGeoRec, and substituted the IRHHtml interface as a place-holder.


    diff('*.diff', '*.patch')
    diff -r dc4b2d236808 -r e4ba0a3e597c ObjMetaObject.pas
    --- a/ObjMetaObject.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/ObjMetaObject.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -16,7 +16,7 @@
     interface
     
     uses
    -  Windows, Classes, SysUtils, IniFiles, RhHtml_TLB,
    +  Windows, Classes, SysUtils, IniFiles, RHHtmlMatch_TLB,
       {$IFNDEF NO_META_TRANSFORM}
       objTransformEngine,
       {$ENDIF}
    @@ -107,7 +107,7 @@
         function GetUnit(const AttrName: string): string;
         function GetPathValue(const AttrName: string;
           const GetFullPath: boolean; const BaseFolder: string): Variant;
    -    function GetComItem(const obj: IRhGeoRec = nil): IRhGeoRec;
    +    function GetComItem(const obj: IRHHtml = nil): IRHHtml;
         procedure GetAttributeList(const Items: TStrings);
         procedure GetTypeList(const Attrs: TStrings; const Types: TStrings);
         function Folder: string;
    @@ -219,10 +219,10 @@
       end;
     end;
     
    -function TMetaObject.GetComItem(const obj: IRhGeoRec): IRhGeoRec;
    +function TMetaObject.GetComItem(const obj: IRHHtml): IRHHtml;
     begin
       if not Assigned(obj) then
    -    result := CoRhGeoRec.Create
    +    result := CoRHHtml.Create
       else
         result := obj;
       // This object and the one in our HTML libary don't completely match.  MDD

####ObjTransformEngine.pas
For some reason, the signature of the spatial reference method changed in 10.x:
```

    diff('*.diff', '*.patch')
    diff -r dc4b2d236808 -r e4ba0a3e597c ObjTransformEngine.pas
    --- a/ObjTransformEngine.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/ObjTransformEngine.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -674,7 +674,8 @@
           GeoWGS84SpatRef.Get_FactoryCode(WGS84Code);
     
           //Set the point spatial Reference to WGS84 since all of our data is in GCS_WGS1984
    -      pointStorage.Set_SpatialReference(GeoWGS84SpatRef);
    +      pointStorage._Set_SpatialReference(GeoWGS84SpatRef);
    +      //pointStorage.Set_SpatialReference(GeoWGS84SpatRef);
     
           Result := True;
         finally
         
```
####RhImageBrowser9.IDL
 
    diff('*.diff', '*.patch')
    diff -r dc4b2d236808 -r e4ba0a3e597c RhImageBrowser9.IDL
    Binary file RhImageBrowser9.IDL has changed
    diff -r dc4b2d236808 -r e4ba0a3e597c RhImageBrowser9.dpr
    --- /dev/null	Thu Jan 01 00:00:00 1970 +0000
    +++ b/RhImageBrowser9.dpr	Tue Mar 25 19:22:13 2014 -0600
    @@ -0,0 +1,57 @@
    +library RhImageBrowser9;
    +
    +uses
    +  ComServ, 
    +  LTLckKey in '..\..\..\..\..\..\..\Program Files\LEAD Technologies\LEADTOOLS 14.5\Uses\LTLckKey.pas',
    +  RhImageBrowserImpl in 'RhImageBrowserImpl.pas' {RhImageBrowserInterface: CoClass},
    +  ImageBrowserPanel in 'ImageBrowserPanel.pas',
    +  RHFileUtils in 'RHFileUtils.pas',
    +  Rhutils in 'rhutils.pas',
    +  IvDictio in 'IvDictio.pas',
    +  ShellOp in 'ShellOp.pas',
    +  ObjArcGisThumbnails in 'ObjArcGisThumbnails.pas',
    +  ImageBrowserLayerList in 'ImageBrowserLayerList.pas',
    +  esriCoreEvents in 'esriCoreEvents.pas',
    +  dmMenus in 'dmMenus.pas' {MenuItems: TDataModule},
    +  ArcGisUtils in 'ArcGisUtils.pas',
    +  ExifInspection in 'ExifInspection.pas' {ExifInspect},
    +  ImageWorks in 'ImageWorks.pas',
    +  ObjCopyExif in 'ObjCopyExif.pas',
    +  dmActions in 'dmActions.pas' {ActionContainer: TDataModule},
    +  DlgMediaProcessingOptions in 'DlgMediaProcessingOptions.pas' {frmMediaProcessorOptions},
    +  ObjAnnotationTemplate in 'ObjAnnotationTemplate.pas',
    +  ObjGmlOptions in 'ObjGmlOptions.pas',
    +  ObjMetaObject in 'ObjMetaObject.pas',
    +  ObjTransformEngine in 'ObjTransformEngine.pas',
    +  Relates in 'Relates.pas',
    +  dlgHyperLinks in 'dlgHyperLinks.pas' {frmHyperLinks},
    +  DlgMulipleRelates in 'DlgMulipleRelates.pas' {frmMulipleRelates},
    +  DlgDeleteMedia in 'DlgDeleteMedia.pas' {dlgDeleteImage},
    +  ObjAttributeReplacer in 'objattributeReplacer.pas',
    +  IncHelp in 'incHelp.pas',
    +  ObjIpixMedia in 'ObjIpixMedia.pas',
    +  RhRegUtils in 'RhRegUtils.pas',
    +  ObjTempFileManagement in 'ObjTempFileManagement.pas',
    +  RhImageBrowser9_TLB in 'RhImageBrowser9_TLB.pas';
    +
    +exports
    +  RhRegUtils.DllGetClassObject,
    +  RhRegUtils.DllCanUnloadNow,
    +  RhRegUtils.DllRegisterServer,
    +  RhRegUtils.DllUnregisterServer;
    +
    +//{$IFDEF ARCMAP9}
    +{$R RHIMAGEBROWSER9.TLB}
    +//{$ELSE}
    +//{$R RHIMAGEBROWSER8.TLB}
    +//{$ENDIF}
    +
    +//{$R *.TLB}
    +
    +{$R *.RES}
    +
    +{$R IMAGEBROWSERBITMAPS.RES}
    +{$R CURSORS.RES}
    +
    +begin
    +end.

####RhImageBrowserImpl.pas
Implement the IContentsView3 interface, which in turn inherits from IContentsView2.
RhImageBrowserImpl.pas was modified to implement the IContentsView3 interface, which in turn inherits from IContentsView2.

The Get_Bitmap method was implemented by lifting a method from one of the destination selection dialogs, with the LoadFromFile changed to LoadFromResourceName to get the SHOWIMGBROWSE icon from a compiled resource, instead of from an invalid ArcMap path.
```

    diff('*.diff', '*.patch')
    diff -r dc4b2d236808 -r e4ba0a3e597c RhImageBrowserImpl.pas
    --- a/RhImageBrowserImpl.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/RhImageBrowserImpl.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -17,7 +17,7 @@
     
     
     uses
    -  ComObj, ActiveX, Windows, AxCtrls, Classes,
    +  ComObj, Windows, Graphics, ActiveX, AxCtrls, Classes,
       {$IFDEF ARCMAP9}
       RhImageBrowser_TLB,
       {$ELSE}
    @@ -31,7 +31,8 @@
     {$ENDIF}
     
     type
    -  TRhImageBrowserInterface = class(TAutoObject, IRhImageBrowserInterface, IContentsView)
    +  TRhImageBrowserInterface = class(TAutoObject, IRhImageBrowserInterface, IContentsView,
    +   IContentsView3)
       private
         FPanel: TImageBrowserPanel;
         FParentHwnd: THandle;
    @@ -39,6 +40,7 @@
         FCurrentFieldNames: string;
         FCurrentField: Integer;
         FActive: boolean;
    +    bmp1: TBitmap;
         function GetDisplay: TImageBrowserPanel;
       public
         procedure Initialize; override;
    @@ -65,6 +67,9 @@
         {$IFDEF ARCMAP9}
         function Get_CurrentTable: IUnknown; safecall;
         procedure Set_CurrentTable(const Value: IUnknown); safecall;
    +    function BasicActivate(parentHWnd: OLE_HANDLE; const Document: IDocument): HResult; stdcall;  
    +    function Get_Bitmap(out Bitmap: OLE_HANDLE): HResult; stdcall;
    +    function Get_Tooltip(out Tooltip: WideString): HResult; stdcall;
         {$ELSE}
         function  Get_CurrentTable: ITable; safecall;
         procedure Set_CurrentTable(const Value: ITable); safecall;
    @@ -274,6 +279,38 @@
       end;
     end;
     
    +function TRhImageBrowserInterface.BasicActivate(parentHWnd: OLE_HANDLE; const Document: IDocument): HResult; stdcall; 
    +begin
    +  result := S_OK;
    +end;
    +
    +function TRhImageBrowserInterface.Get_Bitmap(out Bitmap: OLE_HANDLE): HResult; stdcall;
    +begin
    +  try
    +    if not assigned(bmp1) then
    +    begin
    +      bmp1 := TBitmap.Create;
    +      bmp1.LoadFromResourceName(HInstance, 'SHOWIMGBROWSE');
    +    end;
    +    //Need to turn off range checking to pass the handle value greater than max Integer value
    +    {$R-}
    +    Bitmap := bmp1.Handle;
    +    {$R+}
    +    Result := S_OK;
    +  except
    +    on E:Exception do
    +    begin
    +      raise Exception.Create('TShowImageBrowser.Get_Bitmap error: ' + E.Message);
    +    end;
    +  end;
    +end;
    +
    +function TRhImageBrowserInterface.Get_Tooltip(out Tooltip: WideString): HResult; stdcall;
    +begin
    +  Tooltip := 'PixPoint Image Browser';
    +  result := S_OK;
    +end;
    +
     function TRhImageBrowserInterface.Get_MediaFieldNames: WideString;
     begin
       result := ArcGisUtils.GetImageFields;

```
####UnlockLeadtools.pas
Upgraded to use LeadTools 14.5 from LeadTools 13.

    diff('*.diff', '*.patch')
    diff -r dc4b2d236808 -r e4ba0a3e597c UnlockLeadtools.pas
    --- a/UnlockLeadtools.pas	Mon Jun 10 18:02:27 2013 -0600
    +++ b/UnlockLeadtools.pas	Tue Mar 25 19:22:13 2014 -0600
    @@ -3,7 +3,7 @@
     interface
     
     uses
    -  ImLstVCL, LEADVCL, ThumbVCL;
    +  LEADMain, LEADThmb, LEADImgLst, LTLckKey, LEADDef;
     
     procedure UnlockLeadControl(const ctrl: TLEADImgList); overload;
     procedure UnlockLeadControl(const ctrl: TLEADImage); overload;
    @@ -11,8 +11,6 @@
     
     implementation
     
    -uses
    -  LTVclDef;
     
     // LeadTools constants to unlock GIF/LZW support
     const