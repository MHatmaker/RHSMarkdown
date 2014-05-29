###PxPtOuter
There are several projects in folders underneath the PxPt root folder for functionality dealing with actions initiated by the PixPoint toolbar.  This document describes file changes within the Delphi project (.dpr) at this root level.  The other PixPoint toolbar related projects have their own descriptive documents.


####DlgGenericProgressBar.pas

```
    diff('diff.*', 'patch.*')

    diff -r 6ef04c67ae4c -r 582991107f89 DlgGenericProgressBar.pas
    --- a/DlgGenericProgressBar.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/DlgGenericProgressBar.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -23,7 +23,7 @@
     
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
    -  ComCtrls, StdCtrls, ExtCtrls, dmActions;
    +  ComCtrls, StdCtrls, ExtCtrls, dmActions, PSetting;
     
     type
       TfrmGenericProgressBar = class(TForm)
    diff -r 6ef04c67ae4c -r 582991107f89 DlgMatchOptions.dfm
    --- a/DlgMatchOptions.dfm	Mon Jan 27 18:14:07 2014 -0700
    +++ b/DlgMatchOptions.dfm	Mon Feb 03 17:11:25 2014 -0700
    @@ -150,3 +150,4 @@
         Top = 120
       end
     end
```
####DlgMatchOptions.pas
```

    diff('diff.*', 'patch.*')
    diff -r 6ef04c67ae4c -r 582991107f89 DlgMatchOptions.pas
    --- a/DlgMatchOptions.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/DlgMatchOptions.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -17,7 +17,7 @@
     
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
    -  dmActions, StdCtrls, ExtCtrls;
    +  dmActions, StdCtrls, ExtCtrls, PSetting;
     
     type
       TfrmMatchOptions = class(TForm)
   
```
####DlgSelectDestination.pas
DlgSelectDestination.pas has the exact issues addressed as described in FieldSelect.pas.

Bitmaps in the ArcMap 9.3 directory tree were used in a LoadFromFile are not available in 10.2 


    -      iconPath := arcmapPath + 'icons\layers_2.bmp';
    -      bitmap.LoadFromFile(iconPath);
    +      showMessage('start loading bitmaps');
    +      bitmap.LoadFromResourceName(hInstance,'BMCREATELAYER');

The solution was to compile several images into a resource file and load the icons from the compiled resources.

IStandaloneTable in 10.x differs in method names from 9.3.  A number of interface methods have had an underscore prepended to the method name.

License type enumerations changed between 9.3 and 10.X.  

    +  //if licenseType = esriProductCodeViewer then isArcView := True;
    +  if licenseType = 100 then isArcView := True;
    
This step needs to be modified to return appropriate value from somewhere.  The enumeration variable esriProductCodeViewer is no longer available in 10.x  The old value from 9.3 was 100

```

    diff('diff.*', 'patch.*')
    diff -r 6ef04c67ae4c -r 582991107f89 DlgSelectDestination.pas
    --- a/DlgSelectDestination.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/DlgSelectDestination.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -23,7 +23,7 @@
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
       StdCtrls, ExtCtrls, ComCtrls, Menus, registry, imgList,
    -  customTreeView, dlgLayerInfo, Buttons, ComObj,
    +  customTreeView, dlgLayerInfo, Buttons, ComObj, PSetting,
       esriFramework_TLB, esriArcmapUI_TLB, esriGeometry_TLB, esriCarto_TLB,
       esriSystem_TLB, esriGeoDatabase_TLB, esriCatalogUI_TLB, esriCatalog_TLB;
     
    @@ -121,10 +121,12 @@
     procedure TfrmSelectDestination.FormShow(Sender: TObject);
     var
       regObj: TRegistry;
    -  iconPath: string;
       classIdStr: string;
       bitmap: TBitmap;
     begin
    +  //showMessage('TfrmSelectDestination.FormShow');
    +  //Application.MessageBox('Ready to load controls.',
    +	//		   'TfrmSelectDestination.FormShow', 0);
       lbWarningMessage.caption := '';
     
       newObjectAdded := False;
    @@ -143,6 +145,7 @@
       // get the location of arcexe8x\bin directory and set some icons for the
       // TreeView object
       try
    +    //showMessage('TfrmSelectDestination.FormShow');
         regObj := TRegistry.Create;
         try
           regObj.access := KEY_READ;
    @@ -154,35 +157,37 @@
         finally
           regObj.free;
         end;
    -
    +     {
         if arcmapPath <> '' then
           arcmapPath := ExtractFilePath(arcmapPath);
    +    showMessage(Format('arcmapPath %s', [arcmapPath]));
     
         if not DirectoryExists(arcmapPath) then
           raise Exception.Create('Unable to access the path to Arcmap.exe');
    -
    +        }
    +    //showMessage('TBitmap.Create');
         bitmap := TBitmap.Create;
         try
    -      iconPath := arcmapPath + 'icons\layers_2.bmp';
    -      bitmap.LoadFromFile(iconPath);
    +      //showMessage('start loading bitmaps');
    +      bitmap.LoadFromResourceName(hInstance,'BMCREATELAYER');
           imageList.AddMasked(bitmap, 16711935); // transparency color is magenta for ESRI bitmaps
    -      iconPath := arcmapPath + 'icons\layer_5.bmp';
    -      bitmap.LoadFromFile(iconPath);
    +      bitmap.LoadFromResourceName(hInstance,'BMCREATETABLE');
           imageList.AddMasked(bitmap, 16711935);
           btnCreateLayer.Glyph := bitmap;
    -      iconPath := arcmapPath + 'icons\arcview_table.bmp';
    -      bitmap.LoadFromFile(iconPath);
    +      bitmap.LoadFromResourceName(hInstance,'BMLOADOBJECT');
           imageList.AddMasked(bitmap, 16711935);
           btnCreateTable.Glyph := bitmap;
           tvLayerList.images := imageList;
           tvLayerList.showLines := False;
    -      iconPath := arcmapPath + 'icons\layer_with_arrow_2.bmp';
    -      bitmap.LoadFromFile(iconPath);
    +      bitmap.LoadFromResourceName(hInstance,'BMLOADLAYER');
           btnLoadObject.Glyph := bitmap;
    +      //showMessage('finished loading bitmaps');
         finally
           bitmap.free;
         end;
       except
    +    //MessageBox(self, 'Bitmap problems???', 'Bitmap mess', MB_OK);
    +    showMessage('Bitmap problems???');
         // Don't croak just because the bitmaps don't exist...
       end;
     
    @@ -622,7 +627,7 @@
         pDialog := CoGxDialog.Create as IGxDialog;
         OleCheck(pDialog.Set_Title('Add Data'));
         pFilter := CoGxFilterDatasetsAndLayers.Create as IGxObjectFilter;
    -    OleCheck(pDialog.Set_ObjectFilter(pFilter));
    +    OleCheck(pDialog._Set_ObjectFilter(pFilter));
     
         //an ArcMap bug exists. The dialog will throw an access violation (in mxTools.dll) when an attempt
         //is made to load a standalone table from MS Access
    @@ -649,7 +654,7 @@
                              try
                                pTable := pDataset as ITable;
                                pSATable := CoStandaloneTable.Create as IStandaloneTable;
    -                           OleCheck(pSATable.Set_Table(pTable));
    +                           OleCheck(pSATable._Set_Table(pTable));
                                OleCheck(pTables.AddStandaloneTable(pSATable));
                              except
                                On E:Exception do
    @@ -661,7 +666,7 @@
                              try
                                pFC := pDataset as IFeatureClass;
                                pFL := CoFeatureLayer.Create as IFeatureLayer;
    -                           OleCheck(pFL.Set_FeatureClass(pFC));
    +                           OleCheck(pFL._Set_FeatureClass(pFC));
                                OleCheck(pFC.Get_AliasName(wsLayerName));
                                OleCheck(pFL.Set_Name(wsLayerName));
                                pLayer := pFL as ILayer;
    @@ -676,7 +681,7 @@
                              try
                                pFC := pDataset as IFeatureClass;
                                pFL := CoFeatureLayer.Create as IFeatureLayer;
    -                           OleCheck(pFL.Set_FeatureClass(pFC));
    +                           OleCheck(pFL._Set_FeatureClass(pFC));
                                OleCheck(pFC.Get_AliasName(wsLayerName));
                                OleCheck(pFL.Set_Name(wsLayerName));
                                pLayer := pFL as ILayer;
    @@ -1076,7 +1081,8 @@
       isArcView := False;
       licenseInfo := CoEsriLicenseInfo.create as IEsriLicenseInfo;
       OleCheck(licenseInfo.get_defaultProduct(licenseType));
    -  if licenseType = esriProductCodeViewer then isArcView := True;
    +  //if licenseType = esriProductCodeViewer then isArcView := True;
    +  if licenseType = 100 then isArcView := True;
       licenseInfo := nil;
       FSelectOnly := False;
     end;
   
```
####ObjArcmapExport.pas
There is now an ambiguity on IErrorInfo that didn't exist in previous implementations.
```

    diff('diff.*', 'patch.*')
 
    diff -r 6ef04c67ae4c -r 582991107f89 ObjArcmapExport.pas
    --- a/ObjArcmapExport.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/ObjArcmapExport.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -999,7 +999,7 @@
     ////////////////////////////////////////////////////////////////////////////////
     procedure TArcmapExport.OleCheck2 (hr: HRESULT);
     var
    -    ErrorInfo: IErrorInfo;
    +    ErrorInfo: ActiveX.IErrorInfo;
         Source, Description, HelpFile: WideString;
         HelpContext: Longint;
     begin
     
   
```
####ObjGmlExportHndlr.pas
DoHtmlExport is disabled, since there was no library or source code found to rebuild the project with html support.
```

    diff('diff.*', 'patch.*')
 
    diff -r 6ef04c67ae4c -r 582991107f89 ObjGmlExportHndlr.pas
    --- a/ObjGmlExportHndlr.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/ObjGmlExportHndlr.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -32,7 +32,9 @@
         FExportType: TGmlExportTypes;
         procedure SetExportType(const Value: TGmlExportTypes);
       protected
    +{
         function DoHtmlExport: Integer; virtual;
    +}
         function DoTabExport: Integer; virtual;
         function DoMifExport: Integer; virtual;
         function DoShapeExport: Integer; virtual;
    @@ -53,7 +55,9 @@
       RhUtils,
       FileCtrl,
       ObjMetaObject,
    +{
       ObjHtmlExport,
    +}
       ObjXmlExport,
       ObjArcmapExport,
       ObjAsciiExport,
    @@ -75,6 +79,8 @@
       end;
     end;
     
    +
    +{
     function TGmlExportHandler.DoHtmlExport: Integer;
     begin
       with THtmlExport.Create(self) do try
    @@ -85,6 +91,7 @@
         Free;
       end;
     end;
    +}
     
     function TGmlExportHandler.DoMifExport: Integer;
     begin
    @@ -203,7 +210,9 @@
     
         // Perform the desired operation
         case ExportType of
    +{
           mpHtmlOutput:       result := DoHtmlExport;
    +}      
           mpMapInfoTabOutput: result := DoTabExport;
           mpMapInfoMifOutput: result := DoMifExport;
           mpEsriShapeOutput:  result := DoShapeExport;
       
   
```
####ObjHtmlExport.pas
In order to satisfy requests for an interface for some html-related calls by clients, the RhHtmlMatch project was created with a stubbed implementation of all the methods known in the RhHtml typelib. The RHHtmlMatch project used the typelib to generate a completely stubbed interface to allow ObjHtmlExport.pas to be built.  **Any GUI tools that can be found that interact with the html generation capabilities should be disabled**.

Alternatively, by reviewing the code for exporting the other options:

     case ExportType of
    +{
           mpHtmlOutput:       result := DoHtmlExport;
    +}      
           mpMapInfoTabOutput: result := DoTabExport;
           mpMapInfoMifOutput: result := DoMifExport;
           mpEsriShapeOutput:  result := DoShapeExport;
       
Re-inventing the code that would generate html might be quite simple.  In the above fragment, the open and close curly brackets turn the intevening code into a comment. 
```

    diff('diff.*', 'patch.*')
    diff -r 6ef04c67ae4c -r 582991107f89 ObjHtmlExport.pas
    --- a/ObjHtmlExport.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/ObjHtmlExport.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -16,7 +16,7 @@
     interface
     
     uses
    -  Classes, SysUtils, ObjBaseExport, ObjMetaObject, RhHtml_TLB;
    +  Classes, SysUtils, ObjBaseExport, ObjMetaObject, RhHtmlMatch_TLB;
     
     type
       EHTMLExportException=class(EMediaExportException);
       
```
####ObjMetaObject.pas
The IRhGeoRec interface was not required in this implementation.  It probably should be added at some point for consistency.  Note that in Delphi, an opening curly bracket "{" and closing curly bracket "}" convert all the code between to a comment.
```

    diff('diff.*', 'patch.*')
    diff -r 6ef04c67ae4c -r 582991107f89 ObjMetaObject.pas
    --- a/ObjMetaObject.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/ObjMetaObject.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -16,7 +16,7 @@
     interface
     
     uses
    -  Windows, Classes, SysUtils, IniFiles, RhHtml_TLB,
    +  Windows, Classes, SysUtils, IniFiles, //, RHHtmlMatch_TLB,
       {$IFNDEF NO_META_TRANSFORM}
       objTransformEngine,
       {$ENDIF}
    @@ -107,7 +107,9 @@
         function GetUnit(const AttrName: string): string;
         function GetPathValue(const AttrName: string;
           const GetFullPath: boolean; const BaseFolder: string): Variant;
    +{
         function GetComItem(const obj: IRhGeoRec = nil): IRhGeoRec;
    +}
         procedure GetAttributeList(const Items: TStrings);
         procedure GetTypeList(const Attrs: TStrings; const Types: TStrings);
         function Folder: string;
    @@ -219,6 +221,7 @@
       end;
     end;
     
    +{
     function TMetaObject.GetComItem(const obj: IRhGeoRec): IRhGeoRec;
     begin
       if not Assigned(obj) then
    @@ -245,6 +248,7 @@
       result.Title := self.Title;
       result.Subject := self.Subject;
     end;
    +}
     
     function TMetaObject.GetType(const AttrName: string): string;
     var
   
```
####RhGMLArcmap.dpr
The icons in the destination selection dialog in the 9.3 version relied on loading .bmp files from the icons folder under ArcMap Desktop 9.3.  In 10.x the files are not present, many having been replaced by .png files, often with different names.  In order to avoid depending on hard-coded paths to resources, .png files were created from the .bmp files, and compiled int a resource file that is internalized in the dll.
```

    diff('diff.*', 'patch.*')
 
    diff -r 6ef04c67ae4c -r 582991107f89 RhGMLArcmap.dpr
    --- a/RhGMLArcmap.dpr	Mon Jan 27 18:14:07 2014 -0700
    +++ b/RhGMLArcmap.dpr	Mon Feb 03 17:11:25 2014 -0700
    @@ -3,6 +3,26 @@
     
     
     uses
       ComServ,
       RhGMLArcmap_TLB in 'RhGMLArcmap_TLB.pas',
    @@ -44,6 +64,7 @@
     
     {$R *.TLB}
     
    +{$Resource  'ImagesForDestSelect.res'}
     {$R *.RES}
     
     begin
     
   
```
####RhGMLArcmap_TLB.pas
The type lib interface had to be regenerated for 10.x.  In order to avoid destroying anything under the PixPoint path that was used for 9.3, a duplicate directory was used, with the name PxPt.  In this file, the references to PixPoint are replace by PxPt, and the dates are changed.  Both these changes are in comments, but are documented here, because it could be confusing if the projects are ever rebuilt under the PixPoint folder instead of the PxPt folder.
```
    diff('diff.*', 'patch.*')
    diff -r 6ef04c67ae4c -r 582991107f89 RhGMLArcmap_TLB.pas
    --- a/RhGMLArcmap_TLB.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/RhGMLArcmap_TLB.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -12,7 +12,7 @@
     // ************************************************************************ //
     
     // PASTLWTR : 1.2
    -// File generated on 6/29/2013 1:19:17 PM from Type Library described below.
    +// File generated on 1/31/2014 12:04:36 PM from Type Library described below.
     
     // ************************************************************************  //
     // Type Lib: C:\Users\rhsdev\Documents\Projects\PxPt\RhGMLArcmap.tlb (1
     
```
####RhGmlArcmapImpl.pas
RhGmlArcmapImpl.pas has a number of popup messages inserted that were used in tracking down a couple of startup problems.  These have all been commented.

```

    diff('diff.*', 'patch.*')
    diff -r 6ef04c67ae4c -r 582991107f89 RhGmlArcmapImpl.pas
    --- a/RhGmlArcmapImpl.pas	Mon Jan 27 18:14:07 2014 -0700
    +++ b/RhGmlArcmapImpl.pas	Mon Feb 03 17:11:25 2014 -0700
    @@ -22,7 +22,7 @@
     
     uses
       ComObj, ActiveX, AxCtrls, Classes, RhGMLArcmap_TLB, StdVcl, Windows, dialogs,
    -  DlgArcmapExport, RHPixPoint_TLB;
    +  DlgArcmapExport, RHPixPoint_TLB, PSetting;
     
     type
       TRHGmlArcmapInterface = class(TAutoObject, IConnectionPointContainer, IRHGmlArcmapInterface)
    @@ -81,6 +81,8 @@
     procedure TRHGmlArcmapInterface.Initialize;
     begin
       inherited Initialize;
    +  //Application.MessageBox('TRHGmlArcmapInterface.Initialize',
    +	//		   'TRHGmlArcmapInterface.Initialize', 0);
       FAppHandleSet := False;
       FConnectionPoints := TConnectionPoints.Create(Self);
       if AutoFactory.EventTypeInfo <> nil then
    @@ -90,7 +92,11 @@
       FModal := True;
       FFiles := TStringList.Create;
     
    +  //Application.MessageBox('before CoRHPixPointInterface.Create',
    +	//		   'TRHGmlArcmapInterface.Initialize', 0);
       appInfo := CoRHPixPointInterface.Create;
    +  //Application.MessageBox('after CoRHPixPointInterface.Create',
    +	//		   'TRHGmlArcmapInterface.Initialize', 0);
       //Application.HelpFile := appInfo.HelpFile;
       self.Set_AppTitle(appInfo.name);
       Application.Icon.Handle := appInfo.iconHandle;
    @@ -122,13 +128,36 @@
       end;
     
       // Initialize the PSetting bucket...
    +  //Application.MessageBox('before TActionContainer.Create',
    +	//		   'TRHGmlArcmapInterface.setupApplication', 0);
       ActionContainer := TActionContainer.Create(Application);
    -  ActionContainer.AppSettings.SoftwareName := Application.title;
    +  {
    +  if not Assigned(ActionContainer) then
    +    Application.MessageBox('ActionContainer is nil', 0)
    +  else
    +    Application.MessageBox('ActionContainer is something other than nil', 0);
    +  if not Assigned(ActionContainer.AppSettings) then
    +  begin
    +    ActionContainer.AppSettings := TPAppSettings.create(nil);
    +    Application.MessageBox('ActionContainer.AppSettings is nil', 0);
    +  end
    +  else
    +    Application.MessageBox('ActionContainer.AppSettings is something other than nil', 0);
    +  Application.MessageBox('ActionContainer.AppSettings.SoftwareName',
    +			   'TRHGmlArcmapInterface.setupApplication', 0);
    +  //Application.MessageBox(Application.title,
    +	//		   'TRHGmlArcmapInterface.setupApplication', 0);
     
    +  //ActionContainer.AppSettings.SoftwareName := Application.title;
    +  }
       // Initialize our parent handles prior to form creation
    +  //Application.MessageBox('DlgProcessingWizard.ParentHandle',
    +	//		   'TRHGmlArcmapInterface.setupApplication', 0);
       DlgProcessingWizard.ParentHandle := Get_ParentHwnd;
     
       // Create and initialize our base forms
    +  //Application.MessageBox('before TfrmProcessingWizard.Create',
    +	//		   'TRHGmlArcmapInterface.setupApplication', 0);
       frmProcessingWizard := TfrmProcessingWizard.Create(nil); // I've seen a lot of parenting issues lately if "Application" is used.  MDD
       frmProcessingWizard.Icon.Handle := appInfo.iconHandle;
     //  frmProcessingWizard.HelpFile := appInfo.HelpFile;
    @@ -136,6 +165,8 @@
     
       // Set processing specific options
       DlgArcmapExport.ParentHandle := Get_ParentHwnd;
    +  //Application.MessageBox('before TfrmArcmapExport.Create',
    +	//		   'TRHGmlArcmapInterface.setupApplication', 0);
       frmProcessingWizard.FinalProcessingDlg := TfrmArcmapExport.Create(nil);
     
       with frmProcessingWizard.FinalProcessingDlg as TfrmArcmapExport do
    @@ -148,6 +179,8 @@
         SetArcmapApp(FArcmapApp);
       end;
       frmProcessingWizard.SetArcmapApp(FArcmapApp);
    +  //Application.MessageBox('before frmProcessingWizard.LoadOptions',
    +	//		   'TRHGmlArcmapInterface.setupApplication', 0);
       frmProcessingWizard.LoadOptions;
     end;
     