###GeoVideoToolbar

The GeoVideoToolbar group includes projects that are used by the GeoVideoToolbar project within the group of subfolders.

####RhGeoVideo
RhGeoVideo was not modified, except to change the location of the HostApplication destination.  This is captured in RhGeoVideo\RhGeoVideo.dof, and was probably set manually in the IDE when the location for all the bin files was modified to avoid working in the GeoVideo11 folder.

If the project (or other projects) is moved, the IDE needs to be adjusted to reflect the bin destination.

	-HostApplication=C:\Projects\GeoVideo11\bin\Reg.exe
	+HostApplication=C:\Users\rhsdev\Documents\Projects\GV11\GV11StdCall\bin\Reg.exe

Many of the files under GeoVideoToolbar have Log4Delphi support added.  This is accomplished in the .pas files by adding TLoggerUnit and occasionally TLevelUnit to the uses list. Right-clicking on the TLoggerUnit item in the IDE and selecting open file at cursor will open the source file and reveal the path to the LeadTools14.5 source code.

####RhGeoVideo/RhGeoVideo.dpr

In the .dpr (project) file, LeadTools support is added in the uses list at the top:

	 uses
	+  TConfiguratorUnit,
	+  LTLckKey in '..\..\..\..\..\..\..\Program Files\LEAD Technologies\LEADTOOLS 14.5\Uses\LTLckKey.pas',

and in the initialization part at the bottom:
	
	 begin
	+  TConfiguratorUnit.doPropertiesConfiguration('C:\Users\rhsdev\Documents\ArcGIS\log4delphiGVTB.properties');
	 end.
 
 This has caused a problem in locating the log files on test VM's.  Ideally, the user name would be queried in a system call between the begin and end statements.  The user name could be inserted into the path to allow the properties files to be located under the C:users\user\appdata\local\... path.  However, I was unable to get any sort of run-time path query or determination to work between the begin and end statements in the .dpr file.
 
 It might be possible to have some sort of system query accomplished in a .pas file, and use a Log4Delphi call to change the location of the properties file and the log files dynamically at run time.  I didn't get that far.
 
 Currently, the installer uses a template to place the log4delphiGVTB.properties file in the path shown in the configuration statement above.  This allows the application to start and find the properties file.  The installer creates the path for rhsdev under users, but doesn't actually create user rhsdev. The installer then makes system calls to get the real user and set the log file destination path in the properties file that is created.  The template has most of the log file path hard-coded, with the user name substitution accomplished at installation time.
 
 The statements in the .pas files that write to the log are of the form:
 
      TLogger.GetInstance().Debug('  Indexing Media.');
      
The .diff files in this directory all have the .diff extension.  In Notepad++, any additions between the original and final revisions are highlighted in light blue.  The vast majority of the additions in these .pas source files are TLogger calls.

In some cases, the original logic was modified slightly to support multiple calls to the logger.  For example, in the original, a statement might be:

	if someCondition then
	  doSomething(someArg);
     
This might be modified as:

	if someCondition then begin
	  TLogger.GetInstance().Debug(Format('  someCondition is True, attempt doSomething with arg %s.', [someArg]));
	  retVal := doSomething(someArg);
	  TLogger.GetInstance().Debug(Format('  doSomething returned %s.', [retVal]));
	end;
     
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 RhGeoVideo/RhGeoVideo.dpr
    --- a/RhGeoVideo/RhGeoVideo.dpr	Tue May 28 15:20:26 2013 -0600
    +++ b/RhGeoVideo/RhGeoVideo.dpr	Fri Mar 21 21:27:40 2014 -0600
    @@ -17,6 +17,7 @@
       DllUnregisterServer;
     
     //{$R *.TLB}
    +{R$ RhGeoVideo.tlb}
     
     {$R *.RES}
     {$R IMAGES.RES}
```     
     
####Toolbar/DlgSelectFeatureInfo.pas   
ArcGIS 10.x no longer has an enum value for esriProductCodeViewer, so it is hard-coded here.  Magic numbers should be removed from source code.

	+  //if licenseType = esriProductCodeViewer then isArcView := True;  
	+  if licenseType = 100 then isArcView := True; 
```

    diff('diff.*', 'patch.*')
  
    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/DlgSelectFeatureInfo.pas
    --- a/Toolbar/DlgSelectFeatureInfo.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/DlgSelectFeatureInfo.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -1008,7 +1008,8 @@
       isArcView := False;
       licenseInfo := CoEsriLicenseInfo.create as IEsriLicenseInfo;
       OleCheck(licenseInfo.get_defaultProduct(licenseType));
    -  if licenseType = esriProductCodeViewer then isArcView := True;
    +  //if licenseType = esriProductCodeViewer then isArcView := True;  
    +  if licenseType = 100 then isArcView := True;
       licenseInfo := nil;
```
####Toolbar/DlgSpatialImport.pas
```


    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/DlgSpatialImport.pas
    --- a/Toolbar/DlgSpatialImport.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/DlgSpatialImport.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -237,7 +237,7 @@
     uses
       ComObj, RhFileUtils, RHUtils, Math, ShellApi, ShellOp, FileCtrl, ObjGlobals,
       ObjGeoOptions, ComUtils, ObjGeoSpatialIndexing, ObjGmlImportHndlr,
    -  ObjGeoVideoUtils, MSXML2_TLB;
    +  ObjGeoVideoUtils, MSXML2_TLB, TLoggerUnit, TLevelUnit;
     
     { TfrmAddMediaWizard }
     procedure TfrmAddMediaWizard.CreateParams(var Params: TCreateParams);
    @@ -259,6 +259,8 @@
         Application.HelpFile := gApplicationHelpFile;
         inherited Create(AOwner);
         InitHelp;
    +    TLogger.GetInstance().SetLevel(TLevelUnit.ALL);
    +    TLogger.getInstance().Debug('TfrmAddMediaWizard.CreateDialog');
       except
         On E:Exception do
           raise Exception.Create('TfrmAddMediaWizard.CreateDialog: ' + E.Message);
    @@ -1456,19 +1458,24 @@
           reMatchResults.Lines.Add(ExtractFileName(MediaFile)+':');
     
           reMatchResults.Lines.Add('  Indexing Media...');
    +      TLogger.GetInstance().Debug('TfrmAddMediaWizard.ProcessVideo');
    +      TLogger.GetInstance().Debug('  Indexing Media.');
           if not ProcessMedia(MediaFile, False, ((bSkipAll or bSkipProcessing) and
                                                 (FileExists(ChangeFileExt(MediaFile, '.xml'))))) then begin
             // The files that may exist are probably incomplete.
             //File organization is handled in the mediaObj class
             //DeleteFileSh(Handle,ChangeFileExt(MediaFile, '.xml'),False,False);
             //DeleteFileSh(Handle,ExtractFilePrefix(MediaFile) + '_Ftrs.xml',False,False);
    +        TLogger.GetInstance().Debug('Indexing Media Failed.');
             reMatchResults.Lines.Add('  Indexing Media Failed.');
             bItemFailed := True;
             Inc(iFailedCnt);
           end
           else
    +      begin
    +        TLogger.GetInstance().Debug('Indexing Media Complete.');
             reMatchResults.Lines.Add('  Indexing Media Complete.');
    -
    +      end;
           reMatchResults.Lines.Add('');
     
           ProgressBar.prgbar.Position := 60;
    @@ -1479,13 +1486,19 @@
           begin
             //Try to create the map layers
             reMatchResults.Lines.Add('  Creating Layers...');
    +        TLogger.GetInstance().Debug('Creating Layers...'); 
    +          TLogger.GetInstance().Debug('calling CreateLayers');
             if not CreateLayers(MediaFile, False) then begin
    +          TLogger.GetInstance().Debug('  Error.  Could not create layer for media.');
               reMatchResults.Lines.Add('  Error.  Could not create layer for media.');
               bItemFailed := True;
               Inc(iFailedCnt);
             end
             else
    +        begin                      
    +          TLogger.GetInstance().Debug('  Layer Creation Complete.');
               reMatchResults.Lines.Add('  Layer Creation Complete.');
    +        end
           end;
     
           ProgressBar.prgbar.Position := 80;
    @@ -1534,6 +1547,7 @@
           reMatchResults.Lines.Add(IntToStr(VideoWorkList.Count - iFailedCnt) +
                                    ' out of ' + IntToStr(VideoWorkList.Count) +
                                    ' succeeded.');
    +      TLogger.GetInstance().Debug('Import Complete.');
           result := True;
         end;
       finally
    @@ -2439,9 +2453,13 @@
     
       end
       else begin
    +    TLogger.GetInstance().Debug(Format('mediaPath : %s',[mediaPath]));
         lyrName := ExtractFilePrefix(mediaPath);
    +    TLogger.GetInstance().Debug(Format('lyrName : %s',[lyrName]));
         idxXmlPath := ChangeFileExt(MediaPath,'.xml');
    +    TLogger.GetInstance().Debug(Format('idxXmlPath : %s',[idxXmlPath]));
         ftrXmlPath := ExtractFilePath(mediaPath) + ExtractFilePrefix(mediaPath) + '_Ftrs.xml';
    +    TLogger.GetInstance().Debug(Format('ftrXmlPath : %s',[ftrXmlPath]));
       end;
     
     
    @@ -2455,6 +2473,7 @@
           reMatchResults.Lines.Add('Indexing Media.');
           ProgressBar.prgbar.Position := 0;
           mediaObj := TMediaIndexing.Create(self);
    +
           try
             ProgressBar.StatusCallback1(self, 'Extracting Data...', FCancelled);
             mediaObj.OnProgress := SetProgress;
    @@ -2494,7 +2513,7 @@
       DataFiles: TStringList;
       mediaStyle: Integer;
       bUseRelative: boolean;
    -  ArchiveDir: string;
    +  ArchiveDir, df0: string;
     begin
       ProgressBar.StatusCallback1(self, 'Creating Layer...', FCancelled);
     
    @@ -2528,12 +2547,15 @@
       end
       else begin
         lyrName := ExtractFilePrefix(mediaPath);
    +    TLogger.GetInstance().Debug(Format('lyrName : %s',[lyrName]));
         idxXmlPath := ChangeFileExt(MediaPath,'.xml');
         ftrXmlPath := ExtractFilePath(mediaPath) + ExtractFilePrefix(mediaPath) + '_Ftrs.xml';
    +    TLogger.GetInstance().Debug(Format('ftrXmlPath : %s',[ftrXmlPath]));
         mediaStyle := Ord(mitOther);
       end;
     
       import := TGmlImportHandler.Create(nil);
    +  TLogger.GetInstance().Debug('try to import from TGmlImportHandler');
       try
         import.OnProgress := SetImportProgress;
     
    @@ -2550,6 +2572,7 @@
         end
         else begin
           OutputWorkspace := ExtractFilePath(sProjPathname) + ExtractFilePrefix(sProjPathname) + '_Indexes\';
    +      TLogger.GetInstance().Debug(Format('OutputWorkspace : %s',[OutputWorkspace]));
           IndexShp := ExtractFilePath(IncludeTrailingBackslash(outputWorkspace)) + lyrName + '.shp';
           FeaturesShp := ExtractFilePath(IncludeTrailingBackslash(outputWorkspace)) + lyrName + '_Ftrs.shp';
     
    @@ -2592,6 +2615,7 @@
     
     
         //Create the layer list
    +    TLogger.GetInstance().Debug('Create the layer list');
         DataFiles := TStringList.Create;
         try
           import.ImportType := mpXml;
    @@ -2603,9 +2627,18 @@
     
           //Do the import
           try
    +        TLogger.GetInstance().Debug('try the import');
    +        TLogger.GetInstance().Debug(Format('from %s', [IndexShp]));
    +        df0 :=  DataFiles[0];
    +        TLogger.GetInstance().Debug(Format('using %s', [df0]));
             Result := import.ImportData(DataFiles, IndexShp, False) >= 0;
    +        if(Result = true) then
    +          TLogger.GetInstance().Debug('back from import IndexShp with Result : True')
    +        else
    +          TLogger.GetInstance().Debug('back from import IndexShp with Result : False');
           except
             Result := False;
    +        TLogger.GetInstance().Debug('back from import IndexShp with exception');
             Exit;
           end;
         finally
    @@ -2629,9 +2662,14 @@
     
               try
                 //Do the import of the feature layer, if exists
    -            import.ImportData(DataFiles,FeaturesShp, True);
    +            Result := import.ImportData(DataFiles,FeaturesShp, True) >= 0;
    +            if(Result = true) then
    +              TLogger.GetInstance().Debug('back from import with FeaturesShp Result : True')
    +            else
    +              TLogger.GetInstance().Debug('back from import with FeaturesShp Result : False');
               except
                 Result := False;
    +            TLogger.GetInstance().Debug('back from import FeaturesShp with exception');
                 Exit;
               end;
             finally
             
```
####Toolbar/GeoVideoToolbar.dpr

```

    diff('diff.*', 'patch.*')
    
    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/GeoVideoToolbar.dpr
    --- a/Toolbar/GeoVideoToolbar.dpr	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/GeoVideoToolbar.dpr	Fri Mar 21 21:27:40 2014 -0600
    @@ -1,7 +1,10 @@
     library GeoVideoToolbar;
     
    +{%File 'GeoVideoToolbar.idl'}
    +
     uses
    -  ComServ,
    +  TConfiguratorUnit,
    +  LTLckKey in '..\..\..\..\..\..\..\Program Files\LEAD Technologies\LEADTOOLS 14.5\Uses\LTLckKey.pas',
       GeoVideoToolbar_TLB in 'GeoVideoToolbar_TLB.pas',
       ObjToolbar in 'ObjToolbar.pas' {RhGeoToolbar: CoClass},
       ObjToolbarExtension in 'ObjToolbarExtension.pas' {RhGeoToolbarExtension: CoClass},
    @@ -61,8 +64,10 @@
       RhRegUtils.DllUnregisterServer;
     
     
        +{$R *.TLB}   
         {$R *.RES}
         {$R IMAGES.RES}
         
         begin
        +  TConfiguratorUnit.doPropertiesConfiguration('C:\Users\rhsdev\Documents\ArcGIS\log4delphiGVTB.properties');
         end.

```
####Toolbar/GeoVideoToolbar_TLB.pas 
Toolbar/GeoVideoToolbar_TLB.pas appears to have major changes, however, it is mostly rearrangement.  The guids are the same as in the 9.3 version.  The paths have changed for the .olbs in the comments.
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/GeoVideoToolbar_TLB.pas
    --- a/Toolbar/GeoVideoToolbar_TLB.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/GeoVideoToolbar_TLB.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -12,19 +12,19 @@
     // ************************************************************************ //
     
     // PASTLWTR : 1.2
    -// File generated on 12/30/2012 2:37:15 AM from Type Library described below.
    +// File generated on 12/8/2013 1:27:15 PM from Type Library described below.
     
     // ************************************************************************  //
    -// Type Lib: C:\Users\rhsdev\Documents\Projects\GeoVideo11\Toolbar\GeoVideoToolbar.tlb (1)
    +// Type Lib: C:\Users\rhsdev\Documents\Projects\GV11\GV11StdCall\Toolbar\GeoVideoToolbar.tlb (1)
     // LIBID: {26F9CDCE-8487-46B7-BDD6-5F73BA019F61}
     // LCID: 0
     // Helpfile: 
     // HelpString: Red Hen Systems GeoVideo Toolbar Extension
     // DepndLst: 
     //   (1) v2.0 stdole, (C:\Windows\system32\stdole2.tlb)
    -//   (2) v1.0 esriSystem, (C:\Program Files\ArcGIS\com\esriSystem.olb)
    -//   (3) v1.0 esriArcMapUI, (C:\Program Files\ArcGIS\com\esriArcMapUI.olb)
    -//   (4) v1.0 esriSystemUI, (C:\Program Files\ArcGIS\com\esriSystemUI.olb)
    +//   (2) v10.1 esriSystem, (C:\Program Files\ArcGIS\Desktop10.1\com\esriSystem.olb)
    +//   (3) v10.1 esriArcMapUI, (C:\Program Files\ArcGIS\Desktop10.1\com\esriArcMapUI.olb)
    +//   (4) v10.1 esriSystemUI, (c:\program files\ArcGIS\desktop10.1\com\esrisystemui.olb)
     // ************************************************************************ //
     {$TYPEDADDRESS OFF} // Unit must be compiled without type-checked pointers. 
     {$WARN SYMBOL_PLATFORM OFF}
    @@ -52,22 +52,22 @@
     
       IID_IRhGeoToolbarExtension: TGUID = '{589CCC95-E9C7-4E36-88D1-4003CE629E91}';
       IID_IRhGeoExtController: TGUID = '{EA7DA3E9-4F6F-40FF-AEE8-AA4BCF3949CD}';
    +  IID_IRhGeoToolbar: TGUID = '{1F830D09-3340-4DD1-B47D-C72C89C99077}';
    +  IID_IRhGeoSearchPlay: TGUID = '{A553A635-EA7B-4034-81E1-CAEE5A91AD16}';
    +  IID_IRhGeoSearchPause: TGUID = '{712E1CB8-4790-4D22-B06B-612DA730D11A}';
    +  IID_IRhGeoAutoCenter: TGUID = '{7D1EBF42-0BD9-4A6F-BC53-89DE62665244}';
    +  IID_IRhGeoImport: TGUID = '{E58D88C0-22CB-4547-8947-9C86F6C4E723}';
    +  IID_IRhGeoOptions: TGUID = '{3DA04157-5402-46B2-836D-BA6CFDEAA410}';
    +  IID_IRhGeoDropFeature: TGUID = '{3A3E4026-1154-49A4-8E2C-51DA9E068651}';
    +  IID_IRhGeoGPSInfo: TGUID = '{D1442A01-BE41-4C4A-8521-8638563C0EF3}';
       CLASS_RhGeoToolbarExtension: TGUID = '{06981814-F211-42E1-9879-4773E8ABD5A1}';
    -  IID_IRhGeoToolbar: TGUID = '{1F830D09-3340-4DD1-B47D-C72C89C99077}';
       CLASS_RhGeoToolbar: TGUID = '{490D6FA2-18FA-45D1-BB33-341CA2A223A2}';
    -  IID_IRhGeoSearchPlay: TGUID = '{A553A635-EA7B-4034-81E1-CAEE5A91AD16}';
       CLASS_RhGeoSearchPlay: TGUID = '{A2F313E9-86B3-4FDE-9E31-8C0445ED743E}';
    -  IID_IRhGeoSearchPause: TGUID = '{712E1CB8-4790-4D22-B06B-612DA730D11A}';
       CLASS_RhGeoSearchPause: TGUID = '{98203822-297A-4620-9B2D-50D537D38B11}';
    -  IID_IRhGeoAutoCenter: TGUID = '{7D1EBF42-0BD9-4A6F-BC53-89DE62665244}';
       CLASS_RhGeoAutoCenter: TGUID = '{FC3E62B9-BE39-43C5-8A54-D07F8B98942F}';
    -  IID_IRhGeoImport: TGUID = '{E58D88C0-22CB-4547-8947-9C86F6C4E723}';
       CLASS_RhGeoImport: TGUID = '{79525DC1-1F77-4052-8360-8AB2375CEBA8}';
    -  IID_IRhGeoOptions: TGUID = '{3DA04157-5402-46B2-836D-BA6CFDEAA410}';
       CLASS_RhGeoOptions: TGUID = '{E1B5CD1D-0C3C-4130-8E85-F5CC84356873}';
    -  IID_IRhGeoDropFeature: TGUID = '{3A3E4026-1154-49A4-8E2C-51DA9E068651}';
       CLASS_RhGeoDropFeature: TGUID = '{25CC9D6F-A0A3-41C2-A6EB-81EEA5E5F7A4}';
    -  IID_IRhGeoGPSInfo: TGUID = '{D1442A01-BE41-4C4A-8521-8638563C0EF3}';
       CLASS_RhGeoGPSInfo: TGUID = '{534BF894-3014-46FE-82CC-6628A9A26730}';
     type
 
```
####ObjGeoVideoUtils.pas, ObjGmlImportHndlr.pas, and ObjViewerUtils.pas

TypInfo is added to the uses list to enable logging a string, instead of an enum for MediaTyp or ImportType:

	+  mtString := GetEnumName(TypeInfo(TMediaIndexingType),ord(MediaTyp));
	+  TLogger.GetInstance().Debug(Format('In ReadCompanionFile for MediaType %s, layer %s sLctn %s',
	+     [mtString, LayerName, sLctn]));


####Toolbar/ObjDrawSymbol.pas
Building for 10.x required adding another ESRI component, esriSystem_TLB to the uses list.

```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjDrawSymbol.pas
    --- a/Toolbar/ObjDrawSymbol.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjDrawSymbol.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -17,7 +17,8 @@
     
     uses
       Windows, Classes, ActiveX, SysUtils, Graphics, GeoVideoToolbar_TLB,
    -  esriDisplay_TLB, esriGeometry_TLB;
    +  esriDisplay_TLB, esriGeometry_TLB, esriSystem_TLB;
    +  //esriDisplay_TLB, esriGeometry_TLB;
     
     function SaveSymbolToBitmapFile(hDCOld: Integer; pSymbol: ISymbol; lWidth, lHeight: Integer; sFilepath: string; lGap: Integer = 0): boolean;
     function CreatePictureFromSymbol(hDCOld: Integer; var hBmpNew: Integer; pSymbol: ISymbol; lWidth, lHeight: Integer; lGap: Integer = 0): IPictureDisp;
     
```
####Toolbar/ObjGeoSpatialIndexing.pas

Toolbar/ObjGeoSpatialIndexing.pas is the focus of most of the modifications made to get around the race conditions when importing video media. Most of the changes involved:

1.  Moving some functionality to a background thread to maintain GUI response.
2.  Replacing much of the funtionality of RhGpsParser with VMSNmeaSimpleLib_TLB.VmsNmeaDumper to handle the gps records coming back in nmea record format from RhMediaExtractor in callbacks.

RhGpsParser, RhMediaExtractor, RhGpsXml, and objGeoSpatialIndexing previously worked with threads and event handling COM connection points to handle the flow of extracted gps positions from the audio track to xml format, to loading into an ArcMap layer.  The race conditiona occurred within this framework.

The VMSNmeaSimpleLib_TLB.VmsNmeaDumper takes the approach used in other RHS C++ and C# projects.  The ProcessData callbacks from the media extraction process through the IRhGps interface no longer connect in memory with the RhGpsXml and GeoVideoToolbar code.  Instead, the ProcessData method writes the gps positions to a .nmea file, using the nmea gps logging file format.  A new TPersistXml class is used to read the nmea log file and convert the gps positions to xml records.  Eventually, the xml records are read back in and each position is added to a newly created layer.

In the threading part of the changes, two approaches were tested.

1.  Toolbar/ObjMediaExtractorWorkerThread.pas was an attempt to use the standard Delphi threading libraries, with a standalone class handling the background thread.  From testing results and some research, it appears that the standard Delphi threading libraries are designed to communicate between threads where both of the communicating pairs are Delphi objects.  Problems occur when one of the threads involves handling COM objects.

2.  Alternatives included recommendations to implement the thread handling by dropping down to Window system level threading calls.  This approach appears to work.  The thread handling function is a member of the object that creates it, rather than a standalone class.

Windows threading, with COM CoCreation, is implemented in 

	ThreadProc(startParams: PStartParams): DWORD; stdcall; 
 
In WorkerThreadProc, COM initialization and un-initialization are added, since the media extraction is accomplished in another COM object in a different thread.  This addition was also recommended.

    +  CoInitializeEx( nil, COINIT_APARTMENTTHREADED );
and at the end

    +  CoUninitialize();

In order to pass context to the thread, a Delphi record/pointer was defined:

	+  TStartParams = record
	+        pImxSelf: Pointer;
	+        mediaExtract : TMediaExtract;
	+        wsMediaFile: WideString;
	+        hndlArr : Array[0..255] of THandle;
	+        end;
	+  PStartParams = ^TStartParams;

A TStartParams record is initialized in the TMediaIndexing.Start method:

	+          startParams.pImxSelf := Self;
	+          startParams.mediaExtract := mediaExtract;  
	+          startParams.wsMediaFile := wsMediaFile;
	+
	+          pstartParams := @startParams;
	+          WorkerThreadHandle := CreateThread(nil, 0, @WorkerThreadProc,
	+                     pstartParams, CREATE_SUSPENDED, FWorkerThreadID);
	+
	+          startParams.hndlArr[0] := WorkerThreadHandle;
	+          startParams.hndlArr[1] := ParentWinHandle;  
	
	+          ResumeThread(WorkerThreadHandle);    

The next part of the code calling for thread creation handles messages related to GUI message pumping.  Many combinations of MsgWaitForMultipleObjects, PeekMessage, and DispatchMessage were tested.  WorkerThreadProc also contains a number of MsgWaitForMultipleObjects, etc. steps.  And finally,

 	procedure TMediaIndexing.SetMediaExtractProgress(ASender: TObject; percentDone: Double; var cancelFlag: Integer);
 also contains Windows system level message handling.

The current version left everything in it that worked when the media extraction process finally succeeded.  It is likely that all the steps are overkill.  Many of the experiments, including some commented logic, were failures because the media used in the development was corrupt, missing, or the right codecs were not available.  After finding media files that worked on first attempt, I left in all the Windows system threading calls.

The advantage in using the system level calls, even if the Delphi threading classes could be made to work, is that there are many more examples of handling threading with DirectShow in C++ and C# than in Delphi.  Some of the other Red Hen Systems code handling the media extraction and dumper process contains this logic.  However, those examples aren't necessarily running in a system, such as ArcMap, which is handling GUI events, while at the same time the threading in ObjGeoSpatialIndexing.pas is attempting to keep the progress reports and cancel button in the import dialog responsive.

Due to the switch to VmsNmeaDumper, a number of the connection points handlers were no longer used, and have been deleted:
	
	-    procedure DataParsed(ASender: TObject; const srcObj: IRhGps; const coord: IRhGeo);
	-    procedure RhGpsError(ASender: TObject; const srcObj: IRhGps; const msg: WideString);
	-    procedure RhGpsRangedEvent(ASender: TObject; const srcObj: IRhGps; const coord: IRhGeo;
	-                                                  Range: Double; Inclination: Double;
	-                                                  Azimuth: Double);
	-    procedure RhGpsRemoteSwitch(ASender: TObject; const srcObj: IRhGps; active: WordBool);
	-    procedure RhGpsRFTrigger(ASender: TObject; const srcObj: IRhGps; const raw: WideString;
	-                                                  HzValue: Integer);
	-    procedure RhGpsIntervalMark(ASender: TObject; const srcObj: IRhGps; const intNum: WideString;
	-                                                  const timeOf: WideString);

Although the VmsNmeaDumper replaced RhGpsParser, the member variable names and methods were retained:
	
	-    FgpsParser: TRhGps;
	+    FgpsParser: TVMSNmeaDumper;
	
	-function TMediaIndexing.GetGpsParser: TRhGps;
	+function TMediaIndexing.GetGpsParser: TVMSNmeaDumper;

-    FgpsParser := TRhGps.Create(self);
+    FgpsParser := TVMSNmeaDumper.Create(self);

When the RhMediaExtractor instance is created, the IRhGps interface of VmsNmeaDumper is assinged to one of its properties:

	mediaExtract.GPSParser := gpsParser.DefaultInterface as IRhGps;
      
VmsNmeaDumper inherits from and implements IRhGps (mainly the ProcessData callback).

The WorkerThreadProc and the TMediaIndexing.Start method cooperate, through the TStartParams lResult member variable in retrieving the success code for the media extraction.     

           if (lResult <> 1) and (not FCancelled)then begin
             Failed := true;
             RhShowMessage('Cannot Process media File.');
           end;
           
Unfortunately, the extraction seems to return success (lResult == 1) quite happily when the media has missing or bad data.  In the destination file location where the .nmea and .xml files intermediate files are written prior to the ArcObjects layer creation process, the .nmea file might be empty.  The resulting xml file is empty, so the layer creation message in the Import Dialog reports layer creation failure.  This misleading message prompted adding Log4Delphi support to report some of the intermediate results in the log, facilitating a more accurate determination of the source of the failure.

One of the most confusing aspects of the ObjGeoSpatialIndexing code is in the creation of the FXmlHandler and the FXmlHandlerFeatures objects.  There is no explicit call to the constructors.  Rather, somewhere in the code, there will be logic, such as:

       if Assigned(FXmlHandlerFeatures) then begin
	+        TLogger.GetInstance().Debug('call XmlFeatures.saveDocument after FXmlHandler.openDocument');
         XmlFeatures.saveDocument;
       end;
Apparently,the Assigned method referencing FXmlHandlerFeatures results in the FXmlHandlerFeatures property's method TMediaIndexing.GetXmlHandler being called, with the same process for FXmlHandler.  Explicit calls to the constructors in the client logic would have been easier to follow than having constructor calls in the property getter method:       
       
	function TMediaIndexing.GetXmlHandler: IRHGpsXMLInterface;
	 begin
	   if not Assigned(FXmlHandler) then
	   begin
	+    TLogger.GetInstance().Debug('FXmlHandler := CoRHGpsXMLInterface.Create');
	     FXmlHandler := CoRHGpsXMLInterface.Create;
	     FXmlHandler.dateCreated := firstDate; // if this is left at zero, it will default to todays date
	     FXmlHandler.mediaName := MediaName; // if left blank, will default to 'test' (from .xml filename)
	@@ -343,6 +526,7 @@

	function TMediaIndexing.GetXmlHandlerFeatures: IRHGpsXMLInterface;
	 begin
	   if not Assigned(FXmlHandlerFeatures) then
	   begin
	+    TLogger.GetInstance().Debug('FXmlHandlerFeatures := CoRHGpsXMLInterface.Create');
	     FXmlHandlerFeatures := CoRHGpsXMLInterface.Create;
	     FXmlHandlerFeatures.dateCreated := firstDate; // if this is left at zero, it will default to todays date
	     FXmlHandlerFeatures.mediaName := MediaName; // if left blank, will default to 'test' (from .xml filename)
	@@ -356,17 +540,15 @@

   	result := FXmlHandlerFeatures;
    end;
     
The ObjGeoSpatialIndexing is entered in a couple of places where the log indicates failure that seems like a failure for FXmlHandler, but it is actually a failure for not finding a companion file for FXmlHandlerFeatures, and the interaction with FXmlHandler proceeds.  In combination with the constructors hidden in property methods, this makes following the log file difficult.  It is possible to see the failure for FXmlHandlerFeatures and mistake it for a problem with the RhMediaExtractor/VmsNmeaDumper in some FXmlHandler operation.  At the time this is written, I haven't done any testing with features, so no features compananion files have ever been created or tested.

TMediaIndexing.SaveExistingFiles and TMediaIndexing.RestoreExistingFiles are called to restore from backup files that have been created in case an import that will replace an existing layer is invoked.  When testing with problem media data, it is often necessary to monitor the nmea, xml, and shape file creation while the extraction is in progress.  For example, the video clip module calls back into objGeoSpatialIndexing to create the clip's ArcMap layer.  The clip can be deleted if the import process fails.  It can be difficult to determine the source of the failure, since the intermediate and final files are gone.  However, in the case of a clip, the appearance of the clip media file can be seen in the folder that has been specified as its destination.  If the import process is stopped before it fails, the video clip can be played in Windows Media Player to verify that the clip video is correct.  In this case, the nmea file might be created with no records, the xml file subsequently contains no records, and the import dialog marks the end of the import with a message that the import failed and no layer was created.  This scenario would indicate that the clip was fine, but that the clip might not have valid gps data in the audio track.  Without interrupting the import process, the tester might reach the conclusion that the clip logic failed to create a clip.

The complete diff for ObjGeoSpatialIndexing.pas follows:

```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjGeoSpatialIndexing.pas
    --- a/Toolbar/ObjGeoSpatialIndexing.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjGeoSpatialIndexing.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -16,12 +16,19 @@
     interface
     
     uses
    -  Windows, SysUtils, Classes, MMTypes, RHGpsXml_TLB, RHGpsParser_TLB, RhVmsAudio_TLB,
    -  RhMediaExtractorLib_TLB;
    +  Windows, SysUtils, Classes, MMTypes, RHGpsXml_TLB, VMSNmeaSimpleLib_TLB, RhVmsAudio_TLB,
    +  RhMediaExtractorLib_TLB, GPSLogFileHandler;
     
     type
       TIndexingProgressEvent=procedure(Sender: TObject; percentDone: Integer; var cancelFlag: OleVariant)of object;
       TFileChangeEvent=procedure(Sender: TObject; var fileName: OleVariant) of object;
    +  TStartParams = record
    +        pImxSelf: Pointer;
    +        mediaExtract : TMediaExtract;
    +        wsMediaFile: WideString;
    +        hndlArr : Array[0..255] of THandle;
    +        end;
    +  PStartParams = ^TStartParams;
       TMediaIndexing=class(TComponent)
       private
         FFileSpec: string;
    @@ -36,15 +43,21 @@
         FDvdVol: string;
         poinum: Integer;
         FIndexing: boolean;
    +    FStillDecoding: boolean;  
    +    FWorkerThreadID : DWORD;
    +    WorkerThreadHandle : THandle;
    +    startParams : TStartParams;
         FParentWinHandle: THandle;
         FMediaExtract: TMediaExtract;
    -    FgpsParser: TRhGps;
    +    //FgpsParser: IVMSNmeaDumper;   
    +    FgpsParser: TVMSNmeaDumper;
         FOnProgress: TIndexingProgressEvent;
         FOnFileChange: TFileChangeEvent;
         FCancelled: boolean;
         FDvdTitle: Integer;
         FIndexType: TMediaIndexingType;
         FFailed: boolean;
    +    lResult : Integer;
         FSaveCompanionFile: string;
         procedure SetFileSpec(const Value: string);
         procedure SetTcOffset(const Value: Double);
    @@ -58,20 +71,10 @@
         procedure SetParentWinHandle(const Value: THandle);
         function GetXmlHandler: IRHGpsXMLInterface;
         function GetXmlHandlerFeatures: IRHGpsXMLInterface;
    -    function GetGpsParser: TRhGps;
    +    function GetGpsParser: TVMSNmeaDumper;
         function GetMediaExtract: TMediaExtract;
         procedure SetMediaExtractProgress(ASender: TObject; percentDone: Double; var cancelFlag: Integer);
         procedure SetWorkingFileChange(ASender: TObject; const fileName: WideString);
    -    procedure DataParsed(ASender: TObject; const srcObj: IRhGps; const coord: IRhGeo);
    -    procedure RhGpsError(ASender: TObject; const srcObj: IRhGps; const msg: WideString);
    -    procedure RhGpsRangedEvent(ASender: TObject; const srcObj: IRhGps; const coord: IRhGeo;
    -                                                  Range: Double; Inclination: Double;
    -                                                  Azimuth: Double);
    -    procedure RhGpsRemoteSwitch(ASender: TObject; const srcObj: IRhGps; active: WordBool);
    -    procedure RhGpsRFTrigger(ASender: TObject; const srcObj: IRhGps; const raw: WideString;
    -                                                  HzValue: Integer);
    -    procedure RhGpsIntervalMark(ASender: TObject; const srcObj: IRhGps; const intNum: WideString;
    -                                                  const timeOf: WideString);
     
         procedure SetOnProgress(const Value: TIndexingProgressEvent);
         procedure SetOnFileChange(const Value: TFileChangeEvent);
    @@ -86,8 +89,7 @@
         bFirstPacket: boolean;
         property Xml: IRHGpsXMLInterface read GetXmlHandler;
         property XmlFeatures: IRHGpsXMLInterface read GetXmlHandlerFeatures;
    -    property MediaExtract: TMediaExtract read GetMediaExtract;
    -    property gpsParser: TRhGps read GetGpsParser;
    +    property gpsParser: TVMSNmeaDumper read GetGpsParser;
         property firstDate: TDateTime read FfirstDate write SetfirstDate;
         property sRawTimeCode: string read FsRawTimeCode write SetsRawTimeCode;
       public
    @@ -108,11 +110,15 @@
         property OnProgress: TIndexingProgressEvent read FOnProgress write SetOnProgress;
         property OnFileChange: TFileChangeEvent read FOnFileChange write SetOnFileChange;
         property Failed: boolean read FFailed write FFailed;
    +    property mediaExtract: TMediaExtract read GetMediaExtract;
    +    property stillDecoding : boolean read FStillDecoding write FStillDecoding;
    +    property cancelled : boolean read FCancelled;
       end;
     
     implementation
     
    -uses TimeUtils, RHFileUtils, rhUtils, ShellOp, {$IFNDEF VER130}Variants,{$ENDIF} Dialogs;
    +uses TimeUtils, RHFileUtils, rhUtils, ShellOp, {$IFNDEF VER130}Variants,{$ENDIF} Dialogs,
    +  TLoggerUnit, ObjGlobals, Forms, ActiveX, PersistXml;
     
     function FixValue(const Value: Extended; const Digits: Integer): Extended;
     var
    @@ -124,11 +130,15 @@
     { TMediaIndexing }
     
     constructor TMediaIndexing.Create(AOwner: TComponent);
    +var
    +  curDir : string;
     begin
       inherited;
       FCancelled := false;
       DvdTitle := 1; // Default to the first title
       Failed := false;
    +  Indexing := false;
    +  curDir := GetCurrentDir;
     end;
     
     destructor TMediaIndexing.Destroy;
    @@ -139,13 +149,87 @@
       inherited;
     end;
     
    +function WorkerThreadProc(startParams: PStartParams): DWORD; stdcall;
    +var
    +  pimxSelf : TMediaIndexing;
    +  mediaExtract : TMediaExtract;
    +  wsMediaFile: WideString;
    +  //Msg: TMsg;
    +  //Ret : DWORD;
    +  lResult : Integer;
    +begin
    +  CoInitializeEx( nil, COINIT_APARTMENTTHREADED );
    +  pimxSelf := startParams.pImxSelf;
    +  wsMediaFile :=  startParams.wsMediaFile;
    +  mediaExtract := startParams.mediaExtract;
    +
    +  try
    +    Application.ProcessMessages;  //begin
    +    {
    +    Ret := MsgWaitForMultipleObjects(3, startParams.hndlArr, FALSE, 1000, QS_ALLINPUT);
    +    //then
    +      while PeekMessage (Msg, 0, 0, 0, pm_Remove) do begin
    +          TranslateMessage (Msg); 
    +          DispatchMessage (Msg) 
    +      end;
    +    PostMessage(pimxSelf.ParentWinHandle, WM_THREAD_INFO,
    +          WP_WORKING, GetCurrentThreadID);
    +    }
    +    mediaExtract.ExtractMediaFile(wsMediaFile, lResult);
    +    Application.ProcessMessages;
    +    {
    +    Ret := MsgWaitForMultipleObjects(3, startParams.hndlArr, FALSE, 1000, QS_ALLINPUT);
    +    //then
    +      while PeekMessage (Msg, 0, 0, 0, pm_Remove) do begin
    +          TranslateMessage (Msg);
    +          DispatchMessage (Msg) 
    +      end;
    +
    +    Sleep(100 );      
    +    }
    +    TLogger.GetInstance().Debug(Format(
    +        'TMediaExtractorWorkerThread.TMediaExtract.ExtractMediaFile returned : %d',[lResult]));
    +    pimxSelf.lResult := lResult;
    +    if (lResult <> 1) and (pimxSelf.cancelled = false) //(not pimxSelf.Cancelled)
    +    then
    +    begin
    +      pimxSelf.Failed := true;
    +      //RhShowMessage('TMediaExtractorWorkerThread Cannot Process media File.');
    +      pimxSelf.stillDecoding := False;
    +    end;
    +  except
    +    pimxSelf.stillDecoding := False;
    +  end;
    +  pimxSelf.stillDecoding := False;
    +  {
    +  PostMessage(pimxSelf.ParentWinHandle, WM_THREAD_INFO,
    +          WP_FINISHED, GetCurrentThreadID);
    +  }
    +  Result := 0;
    +  CoUninitialize();
    +end;
    +
     procedure TMediaIndexing.Start;
     var
       lResult : Integer;
    -  wsDvdVol, wsMediaFile: WideString;
    +  wsDvdVol, wsMediaFile, wsNmeaExt, wsFile2Write: WideString;
    +  nsMediaFile, fileNameNoExt : String;
    +  Msg: TMsg;
    +  Ret: DWORD;
    +  napCount : Integer;
    +  napCountInner : Integer;
    +  pstartParams : ^TStartParams;
    +  threadResult : Cardinal;
    +  success : LongBool;
    +  lastError : DWORD;
    +  threadStillActive : boolean;
     begin
       try
    +    lResult := 0;
         Stop;
    +    wsNmeaExt := '.nmea';
    +    //TLogger.GetInstance().Debug(wsNmeaExt);
    +    TLogger.GetInstance().Debug('TMediaIndexing.Start');
         bFirstPacket := True;
         if CompanionFile = '' then
           raise Exception.Create('TMediaIndexing.Start: Companion File not set.');
    @@ -169,7 +253,9 @@
           
           GetXmlHandler;
           GetXmlHandlerFeatures;
    -      mediaExtract.GPSParser := gpsParser.DefaultInterface;
    +      TLogger.GetInstance().Debug('try the gpsParser.DefaultInterface');
    +      mediaExtract.GPSParser := gpsParser.DefaultInterface as IRhGps;
    +      TLogger.GetInstance().Debug('might have a gpsParser.DefaultInterface');
           case (IndexType) of
             mitDvdVol: begin
               // Process the Vob Volume
    @@ -177,11 +263,11 @@
               wsDvdVol := FDvdVol;
     
               //NOTE: Need to allow selection of title(s)
    -          lResult := MediaExtract.ExtractVobVolume(wsDvdVol, DvdTitle);
    +          lResult := mediaExtract.ExtractVobVolume(wsDvdVol, DvdTitle);
     
               if (lResult <> 1) and (not FCancelled)then begin
                 Failed := true;
    -            RhShowMessage('Cannot Process DVD Volume.');
    +            showMessage('Cannot Process DVD Volume.');
               end;
             end;
             mitDvdVob: begin
    @@ -194,13 +280,87 @@
               end;
             end;
             mitOther: begin
    +          //curDir will be the directory containing the media file to be processed.
    +          //curDir := GetCurrentDir;
    +          //TLogger.GetInstance().Debug(curDir);
    +          nsMediaFile := FMediaFilename;
               wsMediaFile := FMediaFilename;
    -          mediaExtract.ExtractMediaFile(wsMediaFile, lResult);
    +          fileNameNoExt := ChangeFileExt(nsMediaFile, '.nmea');
    +          wsFile2Write := WideString(fileNameNoExt);;
    +          TLogger.GetInstance().Debug('where are we going to log?');
    +          TLogger.GetInstance().Debug(wsFile2Write);
     
    +          gpsParser.PrepareToWriteToFile(wsFile2Write);
    +
    +          TLogger.GetInstance().Debug(Format('call TMediaExtract.ExtractMediaFile : %s',[nsMediaFile]));
    +
    +          FWorkerThreadID := 999;
    +          startParams.pImxSelf := Self;
    +          startParams.mediaExtract := mediaExtract;  
    +          startParams.wsMediaFile := wsMediaFile;
    +
    +          pstartParams := @startParams;
    +          WorkerThreadHandle := CreateThread(nil, 0, @WorkerThreadProc,
    +                     pstartParams, CREATE_SUSPENDED, FWorkerThreadID);
    +
    +          startParams.hndlArr[0] := WorkerThreadHandle;
    +          startParams.hndlArr[1] := ParentWinHandle;
    +          ResumeThread(WorkerThreadHandle);
    +
    +          napCount := 0;
    +          stillDecoding := true;
    +          while stillDecoding do
    +          begin
    +            napCountInner := 0;
    +              //Application.ProcessMessages;
    +            Ret := MsgWaitForMultipleObjects(2, startParams.hndlArr,
    +                    FALSE, 1000, QS_ALLINPUT);
    +                    //FALSE, INFINITE, QS_ALLINPUT);
    +            if(Ret <> WAIT_FAILED) then
    +              TLogger.GetInstance().Debug(Format('Inner : Ret =%d',[Ret]))
    +            else
    +              TLogger.GetInstance().Debug(Format('Inner Last Error : %d', [LastError]));
    +            while PeekMessage (Msg, 0, 0, 0, pm_Remove) do begin
    +              napCountInner := napCountInner + 1;
    +              sleep(100);
    +              TranslateMessage (Msg);
    +              DispatchMessage (Msg);
    +            end;               
    +            napCount := napCount + 1;
    +            TLogger.GetInstance().Debug(Format('Nap Count Inner : %d', [napCountInner]));
    +            sleep(100);
    +          end;   
    +          success := false;
    +          threadStillActive := true;
    +          while ( success = false and threadStillActive = true) do
    +          begin
    +            success := GetExitCodeThread(WorkerThreadHandle, threadResult);
    +            if(success = true) then
    +              threadStillActive := false;
    +          end;
    +          if (success = true) then
    +          begin
    +            TLogger.GetInstance().Debug('GetExitCodeThread returned success');
    +            Indexing := True;
    +          end
    +          else
    +            TLogger.GetInstance().Debug('GetExitCodeThread returned failure');
    +
    +          TLogger.GetInstance().Debug(Format('Nap Count : %d', [napCount]));
    +          TLogger.GetInstance().Debug(
    +                    Format('TMediaExtract.ExtractMediaFile returned : %d',[lResult]));
    +          if(Failed = true) then
    +          begin
    +            TLogger.GetInstance().Debug('Failed set to true in worker thread');
               if (lResult <> 1) and (not FCancelled)then begin
                 Failed := true;
                 RhShowMessage('Cannot Process media File.');
               end;
    +          end 
    +          else
    +          begin
    +            TLogger.GetInstance().Debug('Failed was set to false in Worker Thread');
    +          end;
             end;
           end;
         finally
    @@ -212,14 +372,21 @@
     end;
     
     function TMediaIndexing.Stop: boolean;
    +var
    +  cnvGps2Xml : TPersistXML;
    +  nmeaFile : String;
     begin
       result := false;
       try
         try
    -      if not Indexing then Exit;
    +      if not Indexing then begin
    +        TLogger.GetInstance().Debug('Not Indexing here');
    +        Exit;
    +      end;
           FIndexing := False;
     
           if Assigned(FXmlHandler) then begin
    +        TLogger.GetInstance().Debug('call xml.saveDocument - disabled');
             xml.saveDocument;
     
             FXmlHandler := nil;
    @@ -234,27 +401,41 @@
               //registered.
             end;
     
    +        TLogger.GetInstance().Debug('>>>>>>>>>>  TPersistXML.Create');
    +        cnvGps2Xml := TPersistXML.Create(nil);
    +        nmeaFile := ChangeFileExt(CompanionFile, '.nmea');
    +        TLogger.GetInstance().Debug(Format('>>>>>>>>>> TPersistXML.convertGpsLogToXml(%s)', [nmeaFile]));
    +        cnvGps2Xml.convertGpsLogToXml(nmeaFile);
    +        TLogger.GetInstance().Debug('Back from convertGpsLogToXml');
    +        TLogger.GetInstance().Debug(Format('>>>>>>>>>> TPersistXML.gpsPointCount(%d)', [cnvGps2Xml.gpsPointCount]));
    +
             try
    +          TLogger.GetInstance().Debug(Format('CompanionFile %s', [CompanionFile]));
               FXmlHandler.openDocument(CompanionFile);
             except
               on E:Exception do
                 raise Exception.Create('TMediaIndexing.Stop: Can''t open companion file, possible invalid library version. ' + E.Message);
             end;
    +        TLogger.GetInstance().Debug('sleep(100)');
             sleep(100);
     
    +        TLogger.GetInstance().Debug(Format('FXmlHandler.featureCount : %d', [FXmlHandler.featureCount]));
             if (FXmlHandler.featureCount = 0) then begin
               //Bad indexing
               //Restore saved Companion files
               RestoreExistingFiles();
               result := false;
               Failed := True;
    +          TLogger.GetInstance().Debug('Restore and exit');
               Exit;
             end;
    +        TLogger.GetInstance().Debug('Past feature count check');
     //        else
    -//          DeleteBackupFiles();
    +//          DeleteBackupFiles();    // This was also commented in Pristine source file
           end;
     
           if Assigned(FXmlHandlerFeatures) then begin
    +        TLogger.GetInstance().Debug('call XmlFeatures.saveDocument after FXmlHandler.openDocument');
             XmlFeatures.saveDocument;
           end;
           FXmlHandlerFeatures := nil;
    @@ -267,6 +448,7 @@
         FXmlHandler := nil;
         FXmlHandlerFeatures := nil;
         FreeAndNil(FMediaExtract);
    +    FreeAndNil(cnvGps2Xml);
         FreeAndNil(FgpsParser);
       end;
     end;
    @@ -331,6 +513,7 @@
     begin
       if not Assigned(FXmlHandler) then
       begin
    +    TLogger.GetInstance().Debug('FXmlHandler := CoRHGpsXMLInterface.Create');
         FXmlHandler := CoRHGpsXMLInterface.Create;
         FXmlHandler.dateCreated := firstDate; // if this is left at zero, it will default to todays date
         FXmlHandler.mediaName := MediaName; // if left blank, will default to 'test' (from .xml filename)
    @@ -343,6 +526,7 @@
     begin
       if not Assigned(FXmlHandlerFeatures) then
       begin
    +    TLogger.GetInstance().Debug('FXmlHandlerFeatures := CoRHGpsXMLInterface.Create');
         FXmlHandlerFeatures := CoRHGpsXMLInterface.Create;
         FXmlHandlerFeatures.dateCreated := firstDate; // if this is left at zero, it will default to todays date
         FXmlHandlerFeatures.mediaName := MediaName; // if left blank, will default to 'test' (from .xml filename)
    @@ -356,17 +540,15 @@
       result := FXmlHandlerFeatures;
     end;
     
    -function TMediaIndexing.GetGpsParser: TRhGps;
    +function TMediaIndexing.GetGpsParser: TVMSNmeaDumper;
    +
     begin
       if not Assigned(FgpsParser) then
       begin
    -    FgpsParser := TRhGps.Create(self);
    -    FgpsParser.OnDataAvailable := DataParsed;
    -    FgpsParser.OnError := RhGpsError;
    -    FgpsParser.OnRangedEvent := RhGpsRangedEvent;
    -    FgpsParser.OnRemoteSwitch := RhGpsRemoteSwitch;
    -    FgpsParser.OnRFTrigger := RhGpsRFTrigger;
    -    FgpsParser.OnIntervalMark := RhGpsIntervalMark;
    +    TLogger.GetInstance().Debug('call TVMSNmeaDumper.Create');
    +    FgpsParser := TVMSNmeaDumper.Create(self);
    +    //FgpsParser := CoVMSNmeaDumper.Create() as IVMSNmeaDumper;  // Create should return IVMSNmeaDumper anyway.
    +    TLogger.GetInstance().Debug('FgpsParser created with no exception thrown');
       end;
       result := self.FgpsParser;
     end;
    @@ -393,10 +575,23 @@
     procedure TMediaIndexing.SetMediaExtractProgress(ASender: TObject; percentDone: Double; var cancelFlag: Integer);
     var
       ovCancel: OleVariant;
    +  //Msg : TMsg;
     begin
    +  TLogger.GetInstance().Debug('Progress Event listener called');
       if (Assigned(FOnProgress)) then begin
    +    TLogger.GetInstance().Debug(Format('Percent : %f6.2', [percentDone]));
         FOnProgress(ASender, Round(percentDone * 100), ovCancel);
         cancelFlag := ovCancel;
    +    Application.ProcessMessages;
    +    sleep(100);
    +    {
    +            while GetMessage(Msg, ParentWinHandle, 0, 0) do
    +            begin
    +              sleep(100);
    +              TranslateMessage(Msg);
    +              DispatchMessage(Msg);
    +            end;
    +            }
       end;
     
       if ASender is TMediaExtract then
    @@ -411,6 +606,16 @@
           TMediaExtract(ASender).Cancelled := 0;
           FCancelled := false;
         end;
    +    Application.ProcessMessages;
    +    sleep(100);
    +             {
    +            while GetMessage(Msg, ParentWinHandle, 0, 0) do
    +            begin
    +              sleep(100);
    +              TranslateMessage(Msg);
    +              DispatchMessage(Msg);
    +            end;
    +            }
       end;
     end;
     
    @@ -419,218 +624,12 @@
       ovFilename: OleVariant;
     begin
       if (Assigned(FOnFileChange)) then begin
    +    TLogger.GetInstance().Debug(Format('TMediaIndexing.SetWorkingFileChange : %s', [fileName]));
         ovFilename := fileName;
         FOnFileChange(ASender, ovFilename);
       end;
     end;
     
    -///////////////////////////////////////////////////////////////////////////////
    -// Callback Events from TRhGps
    -///////////////////////////////////////////////////////////////////////////////
    -procedure TMediaIndexing.DataParsed(ASender: TObject; const srcObj: IRhGps; const coord: IRhGeo);
    -var
    -  tmpTime: TDateTime;
    -begin
    -  // Because of how the GPS parser responds to events, our first GPS packet may
    -  // have the wrong time.  At worst, we'll lose the first packet of data.  MDD
    -  if bFirstPacket then
    -  begin
    -    bFirstPacket := False;
    -    Exit;
    -  end;
    -
    -  // Store this meta event
    -  sRawTimeCode := coord.VTR_Time;
    -
    -  if firstDate = 0 then
    -    firstDate := coord.UTCDateTime;
    -
    -  if TcOffset <> 0 then
    -  begin
    -    tmpTime := ConvertTimeCode(sRawTimeCode);
    -    tmpTime := tmpTime + FTcDateTime;
    -    sRawTimeCode := GetTimeCode(tmpTime);
    -  end;
    -
    -  // Shift the current timecode
    -  with IDispatch(coord) as IRhGeo do
    -  begin
    -    xml.latitude := FixValue(Latitude,6);
    -    xml.longitude := FixValue(Longitude,6);
    -    xml.altitude := FixValue(Altitude,6);
    -    xml.timeCode := sRawTimeCode;
    -    xml.utcTime := FixValue(UTCDateTime,8);
    -    xml.speed := FixValue(Speed,3);
    -    xml.course := FixValue(Course,3);
    -    xml.azimuth := FixValue(Azimuth,3);
    -    xml.GpsFix := Fix;
    -    xml.GeoidHeight := FixValue(GeoidHeight,3);
    -    xml.dop := dop;
    -    xml.satsinuse := satsinuse;
    -    xml.range := -1;
    -    if not VarIsNull(data) then
    -      xml.data := data;
    -  end;
    -
    -  xml.addFeature;
    -end;
    -
    -procedure TMediaIndexing.RhGpsError(ASender: TObject; const srcObj: IRhGps; const msg: WideString);
    -begin
    -  // Reserved for debugging...  MDD
    -end;
    -
    -procedure TMediaIndexing.RhGpsIntervalMark(ASender: TObject; const srcObj: IRhGps; const intNum: WideString;
    -                                                  const timeOf: WideString);
    -var
    -  data: IRhGeo;
    -begin
    -  srcObj.GetCurrentCoordinates(data);
    -  inc(poinum);
    -
    -  with data do begin
    -    sRawTimeCode := VTR_Time;
    -    xmlFeatures.latitude := FixValue(Latitude,6);
    -    xmlFeatures.longitude := FixValue(Longitude,6);
    -    xmlFeatures.altitude := FixValue(Altitude,6);
    -    xmlFeatures.timeCode := sRawTimeCode;
    -    xmlFeatures.Name := IntNum;
    -    xmlFeatures.utcTime := FixValue(UTCDateTime,8);
    -    xmlFeatures.speed := Speed;
    -    xmlFeatures.course := Course;
    -    xmlFeatures.azimuth := Azimuth;
    -    xmlFeatures.GpsFix := Fix;
    -    xmlFeatures.DOP := DOP;
    -    xmlFeatures.SatsInUse := SatsInUse;
    -    xmlFeatures.GeoidHeight := FixValue(GeoidHeight,3);
    -    xmlFeatures.range := -1;
    -  end;
    -
    -  try
    -    if ((not(TVarData(data.data).VType = varEmpty)) and
    -        (not(TVarData(data.data).VType = varNULL))) then
    -      xmlFeatures.data := data.data;
    -  except
    -    on E:Exception do
    -      //RhShowMessage('Trapped on IRhGeo.data. ' + E.Message);
    -  end;
    -
    -  xmlFeatures.addFeature;
    -end;
    -
    -procedure TMediaIndexing.RhGpsRangedEvent(ASender: TObject; const srcObj: IRhGps; const coord: IRhGeo;
    -                                                  Range: Double; Inclination: Double;
    -                                                  Azimuth: Double);
    -var
    -  data: IRhGeo;
    -begin
    -//  ShowMessage('RhGpsRangedEvent');
    -  data := IDispatch(coord) as IRhGeo;
    -  inc(poinum);
    -
    -  with data do begin
    -//    ShowMessage('RhGpsRangedEvent:in data');
    -    sRawTimeCode := VTR_Time;
    -    xmlFeatures.latitude := FixValue(Latitude,6);
    -    xmlFeatures.longitude := FixValue(Longitude,6);
    -    xmlFeatures.altitude := FixValue(Altitude,6);
    -    xmlFeatures.timeCode := sRawTimeCode;
    -    xmlFeatures.Name :=  'Ranged Object ' + IntToStr(poinum);
    -    xmlFeatures.utcTime := FixValue(UTCDateTime,8);
    -    xmlFeatures.speed := FixValue(Speed,3);
    -    xmlFeatures.course := FixValue(Course,3);
    -    xmlFeatures.azimuth := Azimuth;
    -    xmlFeatures.GpsFix := Fix;
    -    xmlFeatures.DOP := DOP;
    -    xmlFeatures.SatsInUse := SatsInUse;
    -    xmlFeatures.GeoidHeight := FixValue(GeoidHeight,3);
    -    xmlFeatures.range := Range;
    -//    ShowMessage('RhGpsRangedEvent:end data');
    -  end;
    -
    -  try
    -    if ((not(TVarData(data.data).VType = varEmpty)) and
    -        (not(TVarData(data.data).VType = varNULL))) then
    -      xmlFeatures.data := data.data;
    -  except
    -    on E:Exception do
    -      //RhShowMessage('Trapped on IRhGeo.data. ' + E.Message);
    -  end;
    -
    -//  ShowMessage('RhGpsRangedEvent:before addFeature');
    -  xmlFeatures.addFeature;
    -//  ShowMessage('RhGpsRangedEvent:after addFeature');
    -end;
    -
    -procedure TMediaIndexing.RhGpsRemoteSwitch(ASender: TObject; const srcObj: IRhGps; active: WordBool);
    -var
    -  data: IRhGeo;
    -begin
    -  if Active then
    -  begin
    -    srcObj.GetCurrentCoordinates(data);
    -    inc(poinum);
    -
    -    with data do begin
    -      sRawTimeCode := VTR_Time;
    -      xmlFeatures.latitude := FixValue(Latitude,6);
    -      xmlFeatures.longitude := FixValue(Longitude,6);
    -      xmlFeatures.altitude := FixValue(Altitude,6);
    -      xmlFeatures.timeCode := sRawTimeCode;
    -      xmlFeatures.Name := 'Point Of Interest ' + IntToStr(poinum);
    -      xmlFeatures.utcTime := FixValue(UTCDateTime,8);
    -      xmlFeatures.speed := FixValue(Speed,3);
    -      xmlFeatures.course := FixValue(Course,3);
    -      xmlFeatures.azimuth := Azimuth;
    -      xmlFeatures.GpsFix := Fix;
    -      xmlFeatures.DOP := DOP;
    -      xmlFeatures.SatsInUse := SatsInUse;
    -      xmlFeatures.GeoidHeight := FixValue(GeoidHeight,3);
    -      xmlFeatures.range := -1;
    -    end;
    -
    -    try
    -      if ((not(TVarData(data.data).VType = varEmpty)) and
    -          (not(TVarData(data.data).VType = varNULL))) then
    -        xmlFeatures.data := data.data;
    -    except
    -      on E:Exception do
    -        //RhShowMessage('Trapped on IRhGeo.data. ' + E.Message);
    -    end;
    -
    -    xmlFeatures.addFeature;
    -  end;
    -end;
    -
    -procedure TMediaIndexing.RhGpsRFTrigger(ASender: TObject; const srcObj: IRhGps; const raw: WideString;
    -                                                  HzValue: Integer);
    -var
    -  data: IRhGeo;
    -begin
    -  srcObj.GetCurrentCoordinates(data);
    -  inc(poinum);
    -
    -  with data do begin
    -    sRawTimeCode := VTR_Time;
    -    xmlFeatures.latitude := FixValue(Latitude,6);
    -    xmlFeatures.longitude := FixValue(Longitude,6);
    -    xmlFeatures.altitude := FixValue(Altitude,6);
    -    xmlFeatures.timeCode := sRawTimeCode;
    -    xmlFeatures.Name := Format('%.3n MHz',[HzValue/1000000]);
    -    xmlFeatures.utcTime := FixValue(UTCDateTime,8);
    -    xmlFeatures.speed := FixValue(Speed,3);
    -    xmlFeatures.course := FixValue(Course,3);
    -    xmlFeatures.azimuth := Azimuth;
    -    xmlFeatures.GpsFix := Fix;
    -    xmlFeatures.DOP := DOP;
    -    xmlFeatures.SatsInUse := SatsInUse;
    -    xmlFeatures.GeoidHeight := FixValue(GeoidHeight,3);
    -    xmlFeatures.range := -1;
    -    xmlFeatures.data := HzValue;
    -  end;
    -
    -  xmlFeatures.addFeature;
    -end;
     
     ///////////////////////////////////////////////////////////////////////////////
     // Passthrough Events To Pass MediaExtract Events back to form
    @@ -700,7 +699,7 @@
         RenameFile(ptsFilename, ptsFilename + '.bak');
     end;
     
    -{procedure TMediaIndexing.DeleteBackupFiles();
    +{procedure TMediaIndexing.DeleteBackupFiles(); // This method was commented in Pristine source code
     var
       sr: TSearchRec;
       sDir: string;
       
```
####Toolbar/ObjGeoVideoUtils.pas
TypInfo is added to the uses list to enable logging a string, instead of an enum for MediaTyp or ImportType:

	+  mtString := GetEnumName(TypeInfo(TMediaIndexingType),ord(MediaTyp));
	+  TLogger.GetInstance().Debug(Format('In ReadCompanionFile for MediaType %s, layer %s sLctn %s',
	+     [mtString, LayerName, sLctn]));

    
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjGeoVideoUtils.pas
    --- a/Toolbar/ObjGeoVideoUtils.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjGeoVideoUtils.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -40,7 +40,7 @@
     
     uses
       ComObj, SysUtils, Dialogs, Registry, Ver32, ObjGlobals, ObjRhIniFile,
    -  FileCtrl, RhUtils, RhFileUtils, ObjArcmapUtils, esriFramework_TLB, esriSystem_TLB;
    +  FileCtrl, RhUtils, RhFileUtils, ObjArcmapUtils, esriFramework_TLB, esriSystem_TLB, TypInfo, TLoggerUnit;
     
     procedure ShowToolbarBrowser(Value: boolean);
     var
    @@ -330,8 +330,12 @@
       sLayerPathname, sLayerPath, sCompanion: string;
       sType: string;
       sProjectPathname: string;
    +  mtString : string;
     begin
       Result := False;
    +  mtString := GetEnumName(TypeInfo(TMediaIndexingType),ord(MediaTyp));
    +  TLogger.GetInstance().Debug(Format('Inb ReadCompanionFile for MediaType %s, layer %s sLctn %s',
    +     [mtString, LayerName, sLctn]));
     
       sLctn := '';
       sLayerPathname := GetWorkspacePath(LayerName);
    @@ -390,6 +394,9 @@
         else
           MediaTyp := mitNone;
     
    +    mtString := GetEnumName(TypeInfo(TMediaIndexingType),ord(MediaTyp));
    +    TLogger.GetInstance().Debug(Format('In ReadCompanionFile MediaType is now %s, sLctn %s',
    +         [mtString, sLctn]));
         Result := True;
       end;
     end;
```
####Toolbar/ObjGmlImportHndlr.pas

TypInfo is added to the uses list to enable logging a string, instead of an enum for MediaTyp or ImportType:

	+  mtString := GetEnumName(TypeInfo(TMediaIndexingType),ord(MediaTyp));
	+  TLogger.GetInstance().Debug(Format('In ReadCompanionFile for MediaType %s, layer %s sLctn %s',
	+     [mtString, LayerName, sLctn]));

```

diff('diff.*', 'patch.*')
    
    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjGmlImportHndlr.pas
    --- a/Toolbar/ObjGmlImportHndlr.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjGmlImportHndlr.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -21,7 +21,7 @@
     {$ENDIF}
     
     uses
    -  SysUtils, Classes, ObjImportBase, Windows, Dialogs;
    +  SysUtils, Classes, ObjImportBase, Windows, Dialogs, TypInfo;
     
     type
       TGmlImportTypes=(mpNoInput,mpMapInfoTabInput,mpMapInfoMifInput,
    @@ -48,7 +48,7 @@
     
     uses
       ShellOp, RhUtils, FileCtrl, ObjGeoDataObject, ObjImportXml, ObjGlobals,
    -  ObjImportArcmap, Forms;
    +  ObjImportArcmap, Forms, TLoggerUnit;
     
     { TGmlImportHandler }
     ///////////////////////////////////////////////////////////////////////////////
    @@ -90,10 +90,17 @@
     ///////////////////////////////////////////////////////////////////////////////
     function TGmlImportHandler.DoXmlImport: Integer;
     begin
    +    TLogger.GetInstance().Debug('TGmlImportHandler.DoXmlImport - call TXmlImport.Create');
       with TXmlImport.Create(nil) do try
         Assign(self);
    +    TLogger.GetInstance().Debug('TGmlImportHandler.DoXmlImport - call ImportMediaObjects');
    +    try
         result := ImportMediaObjects;
         self.results := results;
    +      //TLogger.GetInstance().Debug(Format('Results : %s',[results]));
    +    except
    +      TLogger.GetInstance().Debug('Exception : TGmlImportHandler.DoXmlImport');
    +    end;
       finally
         Free;
       end;
    @@ -102,6 +109,7 @@
     ///////////////////////////////////////////////////////////////////////////////
     function TGmlImportHandler.DoArcmapImport: Integer;
     begin
    +  TLogger.GetInstance().Debug('In : TGmlImportHandler.DoArcmapImport');
       with TArcmapImport.Create(self) do try
         Assign(self);
         result := ImportMediaObjects;
    @@ -120,7 +128,9 @@
     var
       iFile: Integer;
       dataItem: TGeoDataItem;
    +  enumString : String;
     begin
    +  TLogger.GetInstance().Debug('In TGmlImportHandler.ImportData');
       result := -1;
       Tag := 0;
       DestinationPath := Destination;
    @@ -134,22 +144,40 @@
       // Build our metadata collection
       DataCollection := TCollection.Create(TGeoDataItem);
       try
    +    TLogger.GetInstance().Debug('Populate the metadata collection');
         // Populate the metadata collection
    +    TLogger.GetInstance().Debug(Format('DataList.Count: %d', [DataList.Count]));
    +
         for iFile := 0 to DataList.Count - 1 do
         begin
    -      if DoProgress('Scanning Media...',(iFile/DataList.Count)*100) then Exit;
    +      TLogger.GetInstance().Debug('DoProgress - Scanning Media...');
    +      if DoProgress('Scanning Media...',(iFile/DataList.Count)*100) then
    +      begin
    +        TLogger.GetInstance().Debug('DoProgress - Scanning Media...Quick Exit');
    +        Exit;
    +      end;
    +      TLogger.GetInstance().Debug('How about a Current Fix?');
    +      //ShowMessageFmt('Current Fix: %7.2f, %7.2f, %7.2f',[CurrentFix.Longitude, CurrentFix.Latitude, CurrentFix.Altitude]);
           dataItem := DataCollection.Add as TGeoDataItem;
           dataItem.MediaFile := DataList[iFile];
           dataItem.transformEngine := self.transformEngine;
           dataItem.X := CurrentFix.Longitude;
    +      //ShowMessageFmt('dataItem.X: %7.2f', [dataItem.X]);
           dataItem.Y := CurrentFix.Latitude;
    +      //ShowMessageFmt('dataItem.Y: %7.2f', [dataItem.Y]);
           dataItem.Altitude := CurrentFix.Altitude;
    +      //ShowMessageFmt('dataItem: %7.2f, %7.2f, %7.2f', [dataItem.X, dataItem.Y, dataItem.Altitude]);
           dataItem.Azimuth := CurrentFix.Azimuth;
           dataItem.Time := CurrentFix.UTCDateTime;
           dataItem.TimeCode := CurrentFix.VTR_Time;
    +
    +      //ShowMessageFmt('dataItem: %7.2f, %7.2f, %7.2f', [dataItem.X, dataItem.Y, dataItem.Altitude]);
    +      TLogger.GetInstance().Debug(Format('dataItem: %7.2f, %7.2f, %7.2f', [dataItem.X, dataItem.Y, dataItem.Altitude]));
         end;
     
         // Perform the desired operation
    +    enumString := GetEnumName(TypeInfo(TGmlImportTypes),ord(ImportType));
    +    TLogger.GetInstance().Debug(Format('switch on ImportType %s', [enumString]));
         case ImportType of
           mpMapInfoTabInput: result := DoTabImport;
           mpMapInfoMifInput: result := DoMifImport;
    @@ -164,10 +192,16 @@
         try
           DataCollection.Free;
           DataCollection := nil;
    +      TLogger.GetInstance().Debug('Finally');
    +      //ShowMessage('Finally');
         except
           DataCollection := nil;
    +      TLogger.GetInstance().Debug('Finally, with exception');
    +      //ShowMessage('Finally, with exception');
         end;
       end;
    +  TLogger.GetInstance().Debug('Finally, without exception');
    +  //ShowMessage('Finally, without exception');
     end;
     
     end.


```
####Toolbar/ObjImportXml.pas  

    function TXmlImport.DoImport: Integer; 

contains about 290 lines of torture, including a method encapsulated in the method.  Many lines of intermediate tests and logging were added when import/extraction was failing, since the only error message on the import dialog was that layer creation failed.  Much of the logic checking validity of ArcObjects interface pointers has been deleted.  Some remains in case other importion issues arise.  However, all the pFeatureBuffer pointers, etc. appear to be valid at all times.

This change should probably reverted to the original and tested again with valid data.
	
	+    TLogger.GetInstance().Debug('DataCount > 0');
	-      for iData := 0 to DataCount - 1 do begin
	+      for iData := 0 to DataCount do begin // - 1 do begin

This was confusing at first, because DataCount is always 1 and the log file normally shows something like:

	3/1/2014 3:53:38 PM [DEBUG] DataItems[0].MediaFile C:\Users\rhsdev\Documents\ArcGIS\10.1 Demo_Media\Feb28\GEM_10038001_Feb28.xml

so, DataItems is not related to the count of gps records.

```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjImportXml.pas
    --- a/Toolbar/ObjImportXml.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjImportXml.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -25,7 +25,7 @@
       ObjImportBase, RhUtils, RHGpsXml_TLB, RhShape_TLB,
       esriGeoDatabase_TLB, esriGeometry_TLB, esriDataSourcesFile_TLB,
       esriDataSourcesGDB_TLB, esriCarto_TLB, esriFramework_TLB, esriArcMapUI_TLB,
    -  esriSystem_TLB;
    +  esriSystem_TLB, TypInfo;
     
     type
       EXmlImportException=class(EDataImportException);
    @@ -66,7 +66,8 @@
     implementation
     
     uses
    -  ObjGeoOptions, RHFileUtils, ShellOp, GeoDbSchema, Forms, {$IFNDEF VER130}Variants,{$ENDIF} ObjArcmapUtils;
    +  ObjGeoOptions, RHFileUtils, ShellOp, GeoDbSchema,
    +  Forms, {$IFNDEF VER130}Variants,{$ENDIF} ObjArcmapUtils, TLoggerUnit;
     
     ////////////////////////////////////////////////////////////////////////////////
     function TXmlImport.project(const X, Y: double): RhShpPointRec;
    @@ -121,6 +122,10 @@
       iData: Integer;
       fieldValues: OleVariant;
       dX, dY: Double;
    +  //hres : integer;
    +  //fttype : esriFeatureType;
    +  //fttypeString : String;
    +  //oid : Integer;
       procedure GetValues(var Values: OleVariant);
         function GetId: string;
         const
    @@ -191,31 +196,45 @@
       Result := -1;
       bCancel := False;
     
    +  TLogger.GetInstance().Debug(Format('TXmlImport.DoImport DataCount %d', [DataCount]));
       if DataCount <= 0 then Exit;
       try
    +    TLogger.GetInstance().Debug('DataCount > 0');
         columnTypes := TStringList.create;
         columnTypes.Assign(AttributeTypeList);
         fieldIndexes := TStringList.create;
         try
    -      for iData := 0 to DataCount - 1 do begin
    +      for iData := 0 to DataCount do begin // - 1 do begin
             try
               //Read the xml synchronously
               try
                 gpsXmlIntf.async := False;
               except
    +            Tlogger.GetInstance().Debug('gpsXmlIntf appears to lack the property async');
                 //It is ok to continue, this just means that the property async, does
                 //not exist.  Should not happen unless there is an old version of RhGpsXml.dll
                 //registered.
               end;
               try
    -            if (not gpsXmlIntf.openDocument(DataItems[iData].MediaFile)) then exit;
    +            Tlogger.GetInstance().Debug('show media file');
    +            TLogger.GetInstance().Debug(Format('DataItems[%d].MediaFile %s', [iData, DataItems[iData].MediaFile]));
    +            if (not gpsXmlIntf.openDocument(DataItems[iData].MediaFile)) then
    +            begin
    +              TLogger.GetInstance().Debug(Format('gpsXmlIntf.openDocument failed on %s', [DataItems[iData].MediaFile]));
    +              exit;
    +            end;
               except
               on E:Exception do
                 raise Exception.Create('TXmlImport.DoImport: Can''t open companion file, possible invalid library version. ' + E.Message);
               end;
    +          TLogger.GetInstance().Debug('Companion file opened');
               AppendStandardFolder := True;
     
    -          if (not createObjectClass) then exit;
    +          if (not createObjectClass) then
    +          begin
    +            TLogger.GetInstance().Debug('Could not createObjectClass, so exit');
    +            exit;
    +          end;
     
               //Start Editing Workspace
               try
    @@ -226,12 +245,27 @@
               end;
     
               //Get the number of existing records in the file
    +          if not assigned(FeatureClass) then begin
    +            TLogger.GetInstance().Debug('FeatureClass is not assigned')
    +          end;
               if assigned(FeatureClass) then begin
    +            if FFeatureClass = nil then
    +              TLogger.GetInstance().Debug('FFeatureClass is Nil')
    +            else
    +              try
                 progressString := 'Creating new layer...';
    -            oleCheck(FeatureClass.featureCount(nil,recordsBefore));
    +                //oleCheck(hres);
    +                //hres := FeatureClass.FeatureCount(nil,recordsBefore);
    +                //oleCheck(hres);
    +              except
    +                On E:Exception do
    +                  raise EArcMapWorkspaceException.Create('TXmlImport.DoImport: Failed to get FeatureCount ' + E.Message);
    +
               end;
    +          end;       
    +          TLogger.GetInstance().Debug('tested FeatureClass assignment');
     
    -
    +          TLogger.GetInstance().Debug('Ready to create pFeatSet');
               fieldValues := VarArrayCreate([0,AttributeList.Count - 1],varVariant);
               gpsXmlIntf.moveFirst;
         
    @@ -250,8 +284,8 @@
                     oleCheck(WorkspaceEdit.StartEditOperation);
                     if assigned(FeatureClass) then begin
                       oleCheck(FeatureClass.CreateFeatureBuffer(pFeatureBuffer));
    +                  point := project(gpsXmlIntf.longitude, gpsXmlIntf.latitude);
                       pPoint := CoPoint.create as IPoint;
    -                  point := project(gpsXmlIntf.longitude, gpsXmlIntf.latitude);
                       oleCheck(pPoint.putCoords(point.X, point.Y));
                       pGeometry := pPoint as IGeometry;
                       oleCheck(pFeatureBuffer._Set_Shape(pGeometry));
    @@ -343,12 +377,15 @@
       except
         On E:EArcMapWorkspaceException do begin
           if Assigned(FWorkspaceEdit) then
    +        TLogger.GetInstance().Debug(Format('TXmlImport.DoImport - EArcMapWorkspaceException: %s', [E.Message]));
             oleCheck(WorkspaceEdit.StopEditing(False));
           raise;
         end;
         On E:Exception do begin
           if Assigned(FWorkspaceEdit) then
             oleCheck(WorkspaceEdit.StopEditing(False));
    +        TLogger.GetInstance().Debug('TXmlImport.DoImport- E:Exception');
    +        //TLogger.GetInstance().Debug(Format('TXmlImport.DoImport- E:Exception: %s', [E.Message]));
           raise EXmlImportException.Create('TXmlImport.DoImport: ' + E.Message);
         end;
       end;
    @@ -558,6 +595,11 @@
       pSpatialReference: ISpatialReference;
       spatRefFact: ISpatialReferenceFactory;
       geoCoordSys: IGeographicCoordinateSystem;
    +  //hres : Integer;
    +  //oid : Integer;
    +  //fttype : esriFeatureType;
    +  //fttypeString : String;
    +  //recordsBefore : Integer;
     begin
       result := False;
       sErrorTrack := '0';
    @@ -569,6 +611,8 @@
           inFields := CoFields.create as IFields;
           pFieldsEdit := inFields as IFieldsEdit;
           objectType := newObjectInfo[4];
    +      TLogger.GetInstance().Debug(Format('object type is %s',[objectType]));
    +      TLogger.GetInstance().Debug(Format('gdb or shape file is %s',[newObjectInfo[2]]));
     
           sErrorTrack := '1';
           if pos('Personal Geodatabase',newObjectInfo[2]) > 0 then begin
    @@ -613,6 +657,7 @@
               //For GeoVideo we have already prompted the user to remove layers
               //if RHShowMessage(msgOverwrite,ParentHandle,mtConfirmation,[mbCancel,mbOk],0) = idCancel then Exit;
               sErrorTrack := '11';
    +          TLogger.GetInstance().Debug('Delete a bunch of shape files');
               sysutils.deleteFile(outFileName);
               if newObjectInfo[2] = 'Shapefile Feature Class' then begin
                 sErrorTrack := '12';
    @@ -632,10 +677,15 @@
             oleCheck(pFactory.openFromFile(pathName, 0 , pWorkspace));
             sErrorTrack := Format('13b (%s)',[pathName]);
             pFeatWorkspace := pWorkspace as IFeatureWorkspace;
    +        if Assigned(pFeatWorkspace) then
    +          TLogger.GetInstance().Debug('pFeatWorkspace is assigned')
    +        else
    +          TLogger.GetInstance().Debug('pFeatWorkspace is NOT assigned');
             sErrorTrack := Format('13c (%s)',[pathName]);
             WorkspaceEdit := pWorkspace as IWorkspaceEdit;
             sErrorTrack := Format('13d (%s)',[pathName]);
     
    +        TLogger.GetInstance().Debug('ready to Start Editing Workspace');
             //Start Editing Workspace
             try
               oleCheck(WorkspaceEdit.StartEditing(False));  // In some cases, this will fail if the workspace folder is readonly.  MDD
    @@ -650,6 +700,7 @@
             exit;
           end;
     
    +      TLogger.GetInstance().Debug(Format('set DestinationPath to %s', [outLayerName]) );
           DestinationPath := outLayerName;
     
           //Set up Geometry Definition Object
    @@ -706,6 +757,7 @@
           sErrorTrack := '24';
           getGmlFields(pFieldsEdit, False);
     
    +      TLogger.GetInstance().Debug('add the field index (in inFields) of the GML fields to a list');
           // add the field index (in inFields) of the GML fields to a list
           for i := 0 to AttributeList.Count - 1 do
             if AttributeList[i] <> '' then
    @@ -723,7 +775,12 @@
           if (CompareText(objectType, 'LAYER') = 0) then
           begin
             try
    +         //ShowmessageFmt('pFeatWorkspace creating Layer Name %s', [outLayerName]);
    +         TLogger.GetInstance().Debug(Format('pFeatWorkspace creating Layer Name %s', [outLayerName]));
               pFeatWorkspace.createFeatureClass(outLayerName, inFields, nil, nil, esriFTSimple, 'Shape', '', FFeatureClass);
    +                //ShowmessageFmt('fttype %d', [fttype]);
    +                //oleCheck(hres);
    +                //oleCheck(hres);
             except
               // For the moment, I'm assuming they tried to overwrite an existing layer within
               // a GeoDatabase.  Tell them to load the layer first in ArcMap...  MDD
    @@ -731,11 +788,13 @@
               if bDatabaseExists then
               begin
                 RHShowMessage(msgOverwriteNotAllowed);
    +            TLogger.GetInstance().Debug(msgOverwriteNotAllowed);
                 Exit;
               end
               else
               begin
                 sErrorTrack := '26b';
    +            TLogger.GetInstance().Debug('what are we raising here?');
                 raise; // ???
               end;
             end;
    @@ -761,19 +820,40 @@
             end;
           end;
     
    +                //try
    +                //  hres := FeatureClass.Get_FeatureType(fttype);
    +                //except
    +                //  On E:Exception do
    +                //    raise EArcMapWorkspaceException.Create('TXmlImport.createObjectClass: Failed to get Feature Type ' + E.Message);
    +                //end;
           // Setup Project ".prj" file
           // if the coordinates have been transformed, then write out the appropriate string
           // to a .prj file, otherwise write out the lat/lon WGS84 string
           // For now all Datatypes will be Shapefile Feature Class"
           sErrorTrack := '27';
    +      //ShowMessage(newObjectInfo[2]);
           if newObjectInfo[2] = 'Shapefile Feature Class' then begin
    +      //if 2 > 1 then begin
    +                //try
    +                //  hres := FeatureClass.Get_FeatureType(fttype);
    +                //except
    +                //  On E:Exception do
    +                //    raise EArcMapWorkspaceException.Create('TXmlImport.createObjectClass: Failed to get Feature Type ' + E.Message);
    +                //end;
             sErrorTrack := '28';
             outPrjFile := ChangeFileExt(outFileName,'.prj');
    +        TLogger.GetInstance().Debug(Format('outPrjFile is %s', [outPrjFile]));
             prjString := 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]';
             if assigned(transformEngine) then
               if transformEngine.validOutputCoordSys then
                 prjString := transformEngine.prjFileString;
             assignFile(fileObject, outPrjFile);
    +                //try
    +                //  hres := FeatureClass.Get_FeatureType(fttype);
    +                //except
    +                //  On E:Exception do
    +                //    raise EArcMapWorkspaceException.Create('TXmlImport.createObjectClass: Failed to get Feature Type ' + E.Message);
    +                //end;
             try
               rewrite(fileObject);
               writeln(fileObject,prjString);
    @@ -782,8 +862,21 @@
             end;
     
             sErrorTrack := '29';
    +                //try
    +                //  hres := FeatureClass.Get_FeatureType(fttype);
    +                //except
    +                //  On E:Exception do
    +                //    raise EArcMapWorkspaceException.Create('TXmlImport.createObjectClass: Failed to get Feature Type ' + E.Message);
    +                //end;
           end;
         finally
    +      TLogger.GetInstance().Debug('Finally after StartEditing, ready for StopEditing');      
    +                //try
    +                //  hres := FeatureClass.Get_FeatureType(fttype);
    +                //except
    +                //  On E:Exception do
    +                //    raise EArcMapWorkspaceException.Create('TXmlImport.createObjectClass: Failed to get Feature Type ' + E.Message);
    +                //end;
           sErrorTrack := '30';
           oleCheck(WorkspaceEdit.StopEditing(True));
           inFields := nil;
    @@ -867,7 +960,9 @@
     function TXmlImport.ImportMediaObjects: Integer;
     begin
       try
    +    TLogger.GetInstance().Debug('TXmlImport.ImportMediaObjects - call DoImport');
         result := DoImport;
    +    TLogger.GetInstance().Debug(Format('DoImport returned %d', [result]));
     
         inherited ImportMediaObjects;
       except

```

####Toolbar/ObjJpegConversion.pas
LeadTools 13 was upgraded to LeadTools 14.5
       
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjJpegConversion.pas
    --- a/Toolbar/ObjJpegConversion.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjJpegConversion.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -57,7 +57,8 @@
     implementation
     
     uses
    -  LeadVcl, ltvcltyp, LeadDef, FileCtrl, UnlockLeadTools;
    +  LeadDef, LEADTyp, LEADMain, LEADUnt, FileCtrl, UnlockLeadTools;
    +
     
     { TRHSImageCaptureHndlr }
```
####Toolbar/ObjMediaExtractorWorkerThread.pas
 
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjMediaExtractorWorkerThread.pas
    --- /dev/null	Thu Jan 01 00:00:00 1970 +0000
    +++ b/Toolbar/ObjMediaExtractorWorkerThread.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -0,0 +1,60 @@
    +unit ObjMediaExtractorWorkerThread;
    +
    +interface     
    +uses
    +  Windows, SysUtils, Classes, RhMediaExtractorLib_TLB, ObjGeoSpatialIndexing; //, GPSLogFileHandler;
    +
    +type
    +  TMediaExtractorWorkerThread=class(TThread)
    +  private
    +    pImxSelf : TMediaIndexing;
    +    wsMediaFile : String;
    +  public
    +    constructor Create(CreateSuspended: Boolean; Timeout: Integer;
    +        pmndx : TMediaIndexing; mdf : String ); overload;
    +    //destructor Destroy; override;
    +    procedure Execute; override;
    +  end;
    +
    +implementation
    +
    +uses RHFileUtils, TLoggerUnit, ActiveX, ObjGlobals;
    +
    +constructor TMediaExtractorWorkerThread.Create(CreateSuspended: Boolean; Timeout: Integer;
    +  pmndx : TMediaIndexing; mdf : String);
    +begin
    +  Self.pImxSelf := pmndx;
    +  Self.wsMediaFile := mdf;
    +  Self.FreeOnTerminate := True;
    +  Self.Create(CreateSuspended);
    +end;
    +
    +procedure TMediaExtractorWorkerThread.Execute;
    +var
    +  lResult : Integer;
    +begin
    +  inherited;
    +  //Here we do work
    +  try     
    +    //CoInitializeEx (nil, COINIT_APARTMENTTHREADED);
    +    TLogger.GetInstance().Debug('Execute TMediaExtractorWorkerThread.TMediaExtract.ExtractMediaFile');
    +
    +    pImxSelf.mediaExtract.ExtractMediaFile(wsMediaFile, lResult);
    +      //When we exit the procedure, the thread ends.
    +      //So we don't exit until we're done.
    +    TLogger.GetInstance().Debug(Format(
    +        'TMediaExtractorWorkerThread.TMediaExtract.ExtractMediaFile returned : %d',[lResult]));
    +    if (lResult <> 1) and (not pimxSelf.cancelled)then begin
    +      pImxSelf.Failed := true;
    +      RhShowMessage('TMediaExtractorWorkerThread Cannot Process media File.');
    +      pimxSelf.stillDecoding := False;
    +      if Self.Terminated then exit;
    +    end;
    +  except
    +    pimxSelf.stillDecoding := False;
    +  end;
    +  pimxSelf.stillDecoding := False;
    +  //CoUninitialize
    +end;
    +
    +end.

```
####Toolbar/ObjToolbarExtension.pas
Since this is an extension discovered at run-time by ArcMap, there is some logging to verify that it was found.

```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjToolbarExtension.pas
    --- a/Toolbar/ObjToolbarExtension.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjToolbarExtension.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -36,10 +36,13 @@
         function GetMxDoc: IMxDocument;
         function GetGeoVideoApp: IRHPixPointInterface;
       protected
    +    // IRhGeoExtController interface
         function Get_IsEnabled: WordBool; safecall;
    +    // IExtension interface
         function Get_Name(out extensionName: WideString): HResult; stdcall;
         function Shutdown: HResult; stdcall;
         function Startup(var initializationData: OleVariant): HResult; stdcall;
    +    // IExtensionConfig interface
         function Get_Description(out Description: WideString): HResult; stdcall;
         function Get_ProductName(out Name: WideString): HResult; stdcall;
         function Get_State(out State: esriExtensionState): HResult; stdcall;
    @@ -62,7 +65,7 @@
     
     implementation
     
    -uses ComServ, Forms, SysUtils, ShellApi, ObjGlobals, ObjGeoVideoUtils, RhUtils;
    +uses ComServ, Forms, SysUtils, ShellApi, ObjGlobals, ObjGeoVideoUtils, RhUtils, TLoggerUnit;
     
     procedure TRhGeoToolbarExtension.Initialize;
     begin
    @@ -96,6 +99,7 @@
     function TRhGeoToolbarExtension.GetGeoVideoApp: IRHPixPointInterface;
     begin
       if not Assigned(FGeoVideoApp) then
    +    TLogger.GetInstance().Debug('call CoRhPixPointInterface.Create');
         FGeoVideoApp := CoRhPixPointInterface.Create;
       Result := FGeoVideoApp;
     end;
    @@ -131,6 +135,7 @@
     
         //Start a timer to periodically check to see if we are in demo mode
         if not gLicenseValid then begin
    +      TLogger.GetInstance().Debug('not gLicensValid start time');
           LicenseTimer := TTimer.Create(Application);
           LicenseTimer.OnTimer := CheckDemoMode;
           LicenseTimer.Interval := 5000; //5 secs
    @@ -138,6 +143,7 @@
         end;
     
         CheckValid := True;
    +    TLogger.GetInstance().Debug('call Startup inherited with CheckValid := True');
     
         inherited;
     
    @@ -163,8 +169,10 @@
           gLicenseValid := False;
           MessageDlg('ExtensionStartup error: ' + E.Message, mtError, [mbok], 0);
           Result := E_FAIL;
    +      TLogger.GetInstance().Debug('ExtensionStartup error: ' + E.Message);
         end;
       end;
    +  TLogger.GetInstance().Debug('Startup acted like there was no problem');
     end;
     
     function TRhGeoToolbarExtension.Get_Description(
    @@ -195,6 +203,7 @@
             //Don't display message
             //Pixpoint will handle this through the registration wizard
             //MessageDlg('The extension could not be activated.' + Chr(10) + 'There is no ' + gApplicationName + ' license currently available.', mtError, [mbok], 0);
    +        TLogger.GetInstance.Debug('The extension could not be activated.' + Chr(10) + 'There is no ' + gApplicationName + ' license currently available.');
             Result := E_FAIL;
             FExtensionState := esriESUnavailable;
             Exit;
```
####Toolbar/ObjTracker.pas
Displaying a video in the viewer was causing a lockup in trying to run the tracker, which keeps the gps position cursor on the map synchronized with the time stamp in the video's audio track for the gps position. The fixes were made in Toolbar/ObjTrackerThread.pas, but some of the commented logging is left in ObjTracker.pas.
             
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjTracker.pas
    --- a/Toolbar/ObjTracker.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjTracker.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -112,7 +112,7 @@
     
     implementation
     
    -uses ComServ, Forms, Controls, RhFileUtils;
    +uses ComServ, Forms, Controls, RhFileUtils, TLoggerUnit;
     
     constructor TGeoTracker.Create(AOwner: TComponent);
     begin
    @@ -183,6 +183,7 @@
     procedure TGeoTracker.SendLocation(const ALocation: IUnknown);
     begin
       try
    +    //TLogger.GetInstance().Debug('In TGeoTracker.SendLocation');
         if not bConnectedEvents then
           // Connect to the ActiveView Events
           ConnectActiveView();
    @@ -213,6 +214,7 @@
       deviceRect, cacheRect: tagRECT;
     begin
       try
    +    //TLogger.GetInstance().Debug('TGeoTracker.DrawCursor - check FLocation');
         if FLocation = nil then Exit;
     
         //Set up pointers
    @@ -266,7 +268,9 @@
         ////////////////////
         //AutoCenter section
         ////////////////////
    +    //TLogger.GetInstance().Debug('Draw cursor');
         if AutoCenter then begin
    +      //TLogger.GetInstance().Debug('AutoCenter is true');
           //Get Envelope of ActiveView
           oleCheck(ActiveView.Get_Extent(mapEnvelope));
           oleCheck(mapEnvelope.Get_Width(dmapWidth));
```
####Toolbar/ObjTrackerThread.pas
Clipped from an email in a long sequence on 9/13/13, describing the change from the existing 9.3 code:

In the existing code, a new tracker thread is created on every
callback from the viewer as the viewer location changes.  The thread
is entered, and after resume is called, the thread's execute method
gets called once.  In the logging, the next thing I see is a call to
the thread termination handler, which destroys the thread.  On the
next viewer location change, the whole thing happens again.

I modified the code so that if the thread doesn't already exist, it is
created on the first call from the viewer's location event generator.
Resume and execute get called.  Subsequently, the thread exists, so I
have it call a new method in the thread handler to call the thread's
synchronize method.  Voila, the cursor follows the video and the map
extent shifts as the cursor approaches an edge.

I think the existing code is a little bizarre, but I still want to see
if I can understand why it worked in Delphi 5/ArcGIS 9.3 before I
replace it with my code.  Now that I do have it working, I can see
that the existing code did differ from the Delphi 7 threading demo.
The demo code only created the background thread once, and called the
equivalent of my move method on every drawing update event.  At any
rate, the version I have would be significantly easier to understand
by some other programmer in the future, since it does follow the
Delphi 7 threading demo code exactly.

The revised version replaced the 9.3 version at this point.

	+procedure TTrackerThrd.FixChanged(fix : IRhGeo);
	+begin
	+  FCurrentFix.AssignData(fix);
	+  FTracker.AutoCenter := FAutoCenter;
	+  Synchronize(UpdateTracker);
	+end;
	+

           
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjTrackerThread.pas
    --- a/Toolbar/ObjTrackerThread.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjTrackerThread.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -22,17 +22,18 @@
         procedure Execute; override;
       public
         constructor CreateThrd(bSuspended: boolean; AOwner: TComponent);
    -    property AutoCenter: boolean write FAutoCenter;
    +    property AutoCenter: boolean read FAutoCenter write FAutoCenter;
         property ShowCameraDirection: boolean write FShowCameraDirection;
         property CurrentFix: IRhGeo read GetCurrentFix write FCurrentFix;
         property CurrentLayerName: string read GetCurrentLayerName write SetCurrentLayerName;
         property Tracker: TGeoTracker read GetTracker write FTracker;
         property ParentComponent: TComponent write FParentComp;
    +    procedure FixChanged(fix : IRhGeo);
       end;
     
     implementation
     
    -uses SysUtils, Forms, ObjGlobals;
    +uses SysUtils, Forms, ObjGlobals, TLoggerUnit;
     
     constructor TTrackerThrd.CreateThrd(bSuspended: boolean; AOwner: TComponent);
     begin
    @@ -51,9 +52,12 @@
     
     function TTrackerThrd.GetCurrentFix: IRhGeo;
     begin
    +  //TLogger.GetInstance().Debug('TTrackerThrd.GetCurrentFix');
       if not Assigned(FCurrentFix) then
    +  begin
         FCurrentFix := CoRhGeo.Create as IRhGeo;
    -
    +    TLogger.GetInstance().Debug('TTrackerThrd.GetCurrentFix created FCurrentFix IRhGeo');
    +  end;
       Result := FCurrentFix;
     end;
     
    @@ -67,8 +71,16 @@
       FCurrentLayerName := Value;
     end;
     
    +procedure TTrackerThrd.FixChanged(fix : IRhGeo);
    +begin
    +  FCurrentFix.AssignData(fix);
    +  FTracker.AutoCenter := FAutoCenter;
    +  Synchronize(UpdateTracker);
    +end;
    +
     procedure TTrackerThrd.UpdateTracker;
     begin
    +  //TLogger.GetInstance().Debug('TTrackerThrd.UpdateTracker');
       Tracker.AutoCenter := FAutoCenter;
       Tracker.ShowCameraDirection := FShowCameraDirection;
       Tracker.LayerName := CurrentLayerName;
    @@ -77,7 +89,10 @@
     
     procedure TTrackerThrd.Execute;
     begin
    +  TLogger.GetInstance().Debug(Format('TTrackerThrd.Execute : Self.Terminated %s, Assigned (FCurrentFix) %s',
    +    [BoolToStr(Self.Terminated, True), BoolToStr(Assigned(FCurrentFix), True)]));
       if ((not Self.Terminated) and (Assigned(FCurrentFix))) then begin
    +     TLogger.GetInstance().Debug('OK, Synchronize');
          Synchronize(UpdateTracker);
       end;
     end;
```
####Toolbar/ObjVidClipUtils.pas
     
```
    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjVidClipUtils.pas
    --- a/Toolbar/ObjVidClipUtils.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjVidClipUtils.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -67,7 +67,7 @@
     
     uses ComObj, SysUtils, Forms, Dialogs, FileCtrl, RhUtils, RhFileUtils, ShellOp,
          MMTypes, ObjGeoVideoUtils, ObjGeoOptions, ObjGeoSpatialIndexing,
    -     {$IFDEF GV11} dlgLayerStore, {$ENDIF} ObjGmlImportHndlr;
    +     {$IFDEF GV11} dlgLayerStore, {$ENDIF} ObjGmlImportHndlr, TLoggerUnit;
     
     { TVidClipUtils }
     
    @@ -148,12 +148,15 @@
           EnableTaskWindows(WindowList);
         end;
         if (frmStorageChoice.UsingGDB) then begin
    +      TLogger.GetInstance().Debug('choice is really dftGdbFtrCls');
           DataFormat := dftGdbFtrCls;
           //If GeoDatabase is selected then choose which GDB to store it in
           ChooseGdbStore();
         end
    -    else
    +    else begin
    +      TLogger.GetInstance().Debug('choice is really dftShpFtrCls');
           DataFormat := dftShpFtrCls;
    +    end;
       finally
         frmStorageChoice.free;
       end;
    @@ -164,7 +167,9 @@
       //Check for Existing layers in map, and prompt to remove
       bRemoveLayer := False;
     
    +  TLogger.GetInstance().Debug('Get ready to extract');
       if (DataFormat in [dftGdbFtrCls, dftGdbTbl]) then begin
    +    TLogger.GetInstance().Debug('DataFormat is dftGdbFtrCls or dftGdbTbl');
         IndexShp := changeFileExt(outputWorkspace,'')+'_'+ExtractFilePrefix(VideoClipFile);
         FeaturesShp := changeFileExt(outputWorkspace,'')+'_'+ExtractFilePrefix(VideoClipFile) + '_Ftrs';
     
    @@ -198,9 +203,15 @@
         end;
       end  //GDB
       else begin
    +    TLogger.GetInstance().Debug('ExtractFilePath');
    +    TLogger.GetInstance().Debug(Format('ExtractFilePath from %s', [sProjectPathname]));
         OutputWorkspace := ExtractFilePath(sProjectPathname) + ExtractFilePrefix(sProjectPathname) + '_Indexes\';
    +
    +    TLogger.GetInstance().Debug(Format('stick OutputWorkspace in %s', [OutputWorkspace]));
         IndexShp := ExtractFilePath(sProjectPathname) + ExtractFilePrefix(sProjectPathname) + '_Indexes\' + ExtractFilePrefix(VideoClipFile) + '.shp';
    +    TLogger.GetInstance().Debug(Format('stick IndexShp in %s', [IndexShp]));
         FeaturesShp := ExtractFilePath(sProjectPathname) + ExtractFilePrefix(sProjectPathname) + '_Indexes\' + ExtractFilePrefix(VideoClipFile) + '_Ftrs.shp';
    +    TLogger.GetInstance().Debug(Format('stick FeaturesShp in %s', [FeaturesShp]));
     
         // Check to see if 'tab' file already exists, prompt user to overwrite
         if (FileExists(IndexShp)) then begin
    @@ -228,7 +239,7 @@
           end;
         end; //Remove Layer
       end; //Shapefile
    -
    +  TLogger.GetInstance().Debug(Format('NewObjectInfo.count = %d', [NewObjectInfo.count]));
       if NewObjectInfo.count = 0 then begin
         NewObjectInfo.add('');
         NewObjectInfo.add(ExtractFilePrefix(VideoClipFile));
    @@ -276,6 +287,7 @@
           mediaObj.CompanionFile := ChangeFileExt(VideoClipFile, '.xml');
           mediaObj.MediaName := ExtractFilePrefix(VideoClipFile);
           mediaObj.MediaFilename := VideoClipFile;
    +      TLogger.GetInstance().Debug(Format('ready to start mediaObj = %s', [VideoClipFile]));
     
           try
             mediaObj.Start; //Begin Processing
    @@ -290,6 +302,8 @@
     
         if bFailed then begin
           // The files that may exist are probably incomplete.
    +      TLogger.GetInstance().Debug(Format('failed branch : %s',
    +        ['The files that may exist are probably incomplete.']));
           DeleteFileSh(Application.Handle,ChangeFileExt(VideoClipFile, '.xml'),False,False);
           DeleteFileSh(Application.Handle,ExtractFilePath(VideoClipFile) + ExtractFilePrefix(VideoClipFile) + '_Ftrs.xml',False,False);
           DeleteFileSh(Application.Handle,ExtractFilePath(VideoClipFile) + ExtractFileName(VideoClipFile),False,False);
    @@ -390,7 +404,11 @@
         end //not Failed
         else begin
           if not FCancelled then
    +      begin
             MessageDlg('TVidClipUtils.DoVideoClipProcess: Unable to Index Media file.', mtError, [mbok], 0);
    +        TLogger.GetInstance().Debug(Format('failed branch : %s',
    +          ['The files that may exist are probably incomplete.']));
    +        end;
         end;
       end; // not Cancelled
```
####Toolbar/ObjViewerUtils.pas
This is the client code that creates the tracker thread handled in Toolbar/ObjTrackerThread.pas.
The following changes reflect the discussion in the email clip above.

	-      if Assigned(TrackerThrd) then begin   <<<<< this happened on every position change
	-        TrackerThrd.Terminate;
	-        TrackerThrd := nil;
	-      end;
	-      TrackerThrd := TTrackerThrd.CreateThrd(True, Self);
	
	+      if not Assigned(TrackerThrd) then begin        <<<<<<< this occurs only on the first position change
	+        TLogger.GetInstance().Debug('Create TrackerThrd');
	+        TrackerThrd := TTrackerThrd.CreateThrd(True, Self);
     
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/ObjViewerUtils.pas
    --- a/Toolbar/ObjViewerUtils.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/ObjViewerUtils.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -26,7 +26,7 @@
       Nmea, RhMediaViewer_TLB, RhGpsParser_TLB, GeoVideoToolbar_TLB, MMTypes,
       {$IFDEF GV11}ObjVidClipUtils,{$ENDIF}
       esriArcMapUI_TLB, esriFramework_TLB, esriCarto_TLB, esriSystemUI_TLB,
    -  esriSystem_TLB;
    +  esriSystem_TLB, TypInfo;
     
     const
       WM_GEO_MEDIA_END = WM_USER + $030F;
    @@ -158,7 +158,7 @@
     
     uses
       ComObj, Dialogs, RhUtils, RhFileUtils, FileCtrl, ActiveX, ObjGeoVideoUtils,
    -  ObjArcmapUtils, ObjRhIniFile, {$IFNDEF VER130}Variants,{$ENDIF}MSXML2_TLB;
    +  ObjArcmapUtils, ObjRhIniFile, {$IFNDEF VER130}Variants,{$ENDIF}MSXML2_TLB, TLoggerUnit;
     
     var
       PrevInstance: TViewerUtils = nil;
    @@ -755,6 +755,7 @@
     begin
       Result := False;
     
    +  TLogger.GetInstance().Debug(Format('TViewerUtils.GetXmlLocation : Initial XMLDir is %s', [XmlDir]));
       //Value is already set so do not search for it
       if ((XmlDir <> '') and DirectoryExists(XmlDir)) then begin
         Result := True;
    @@ -803,6 +804,7 @@
                MatchingDvdXml(sVolName, sArchive + Rec.Name + '\gps_data\RhDvdGps.xml')then begin
               XmlDirectory := sArchive + Rec.Name;
               XmlDir := XmlDirectory;
    +          TLogger.GetInstance().Debug(Format('XMLDir before first exit is %s', [XmlDir]));
               Result := True;
               Exit;
             end;
    @@ -816,6 +818,7 @@
            MatchingDvdXml(sVolName, Location + 'gps_data\RhDvdGps.xml') then begin
           XmlDirectory := Location;
           XmlDir := XmlDirectory;
    +      TLogger.GetInstance().Debug(Format('XMLDir before second exit is %s', [XmlDir]));
           Result := True;
           Exit;
         end;
    @@ -827,12 +830,14 @@
              MatchingDvdXml(sVolName, Location + 'gps_data\RhDvdGps.xml') then begin
             XmlDirectory := Location;
             XmlDir := XmlDirectory;
    +        TLogger.GetInstance().Debug(Format('XMLDir before third exit is %s', [XmlDir]));
             Result := True;
             Exit;
           end;
         end;
       finally
         sDrives.Free;
    +    TLogger.GetInstance().Debug(Format('XMLDir at finally is %s', [XmlDir]));
       end;
     
     
    @@ -881,10 +886,13 @@
       bFound, bCompanionExists: boolean;
       shpDir: string;
       sProjPathname: string;
    +  mtString : string;
     begin
    +  //TLogger.GetInstance().Debug('TViewerUtils.ShowLiveVideo.ShowLiveVideo');
    +  mtString := GetEnumName(TypeInfo(TMediaIndexingType),ord(MediaType));
    +  TLogger.GetInstance().Debug(Format('MediaType is %s', [mtString]));
       try
    -    if gShowingLiveVideo then begin
    -      if (SelectedLayerName <> CurrentVolume) then begin
    +    if gShowingLiveVideo then begin      if (SelectedLayerName <> CurrentVolume) then begin
             //Reset the viewer
             if Assigned(Viewer) then
               Viewer.Reset;
    @@ -893,7 +901,9 @@
             bFound := False;
             bCompanionExists := False;
     
    +        TLogger.GetInstance().Debug(Format('ShowLiveVideo.ReadCompanionFile at path %s, %s', [SelectedLayerName, mediaLctn]));
             if ReadCompanionFile(SelectedLayerName, FMediaType, mediaLctn) then begin
    +          TLogger.GetInstance().Debug('found companion file');
               //Media Location found in Companion file
               if (MediaType in [mitDvdVol, mitDvdVob]) then begin
                 //07/05/05 - BB For now force other search mechanisms for dvd media
    @@ -901,6 +911,7 @@
                 bFound := False;
               end
               else begin
    +            TLogger.GetInstance().Debug('Did not find companion file');
                 //Set the CurrentVolume from the SelectedLayerName
                 CurrentVolume := SelectedLayerName;
                 bFound := True;
    @@ -910,6 +921,7 @@
     
             if not bFound then begin
               if (MediaType in [mitNone, mitDvdVol, mitDvdVob]) then begin
    +            TLogger.GetInstance().Debug('call GetDvdInProjectLctn');
                 if GetDvdInProjectLctn(SelectedLayerName, mediaLctn) then begin
                   //if Dvd volume was found under Project location, then
                   //the xml location is the same as the dvd location
    @@ -926,6 +938,7 @@
     
             if not bFound then begin
               if (MediaType in [mitNone, mitDvdVol, mitDvdVob]) then begin
    +            TLogger.GetInstance().Debug('call GetDvdLocation');
                 //Continue to search for it in the archive and Dvd drive.
                 if GetDvdLocation(SelectedLayerName, DvdDir) then begin
                   MediaType := mitDvdVol;
    @@ -938,15 +951,18 @@
             //We are done searching in all locations
             //Continue if one method succeeded
             if (bFound) then begin
    +          TLogger.GetInstance().Debug(Format('eventually found companion file in dir %s', [XmlDir]));
               //Remove any existing cursors if they exist
               if Assigned(FTracker) then begin
                 FreeAndNil(FTracker);
               end;
     
               if (MediaType in [mitDvdVol, mitDvdVob]) then begin
    +            TLogger.GetInstance().Debug('MediaType is DVD, might need to CreateMediaCompanionFile' );
    +            if not bCompanionExists then begin
    +              TLogger.GetInstance().Debug('We do need to CreateMediaCompanionFile' );
                 //If the Companion File did not exist, create it for more efficient
                 //searches
    -            {if not bCompanionExists then begin
                   //Create the CompanionFile
                   shpDir := ExtractFilePath(GetWorkspacePath(SelectedLayerName));
                   FixDir(shpDir);
    @@ -954,10 +970,11 @@
                   //Format media path to be a relative path
                     //Get the root path to the _Media subdir
                     sProjPathname := GetDocumentPathname(gArcmapApp);
    +                TLogger.GetInstance().Debug(Format('Project path is %s', [sProjPathName]));
     
    -              CreateMediaCompanionFile(shpDir+SelectedLayerName+'.rhs', Ord(mitDvdVol), DvdDir,not DirectoryExists(RhGetRelativeFilename(DvdDir, ExtractFilePath(sProjPathname)))));
    +              CreateMediaCompanionFile(shpDir+SelectedLayerName+'.rhs', Ord(mitDvdVol), DvdDir,not DirectoryExists(RhGetRelativeFilename(DvdDir, ExtractFilePath(sProjPathname))));
                 end; //bCompanionExists
    -            }
    +            
     
                 //Dvd Volume
                 Viewer.MediaIndexType := Ord(MediaType);
    @@ -966,6 +983,7 @@
     
                 //Set caption to the media name
                 Viewer.formCaption := SelectedLayerName;
    +            TLogger.GetInstance().Debug('is viewer showing?');
                 if (not Viewer.IsShowing) then
                   Viewer.Show;
     
    @@ -979,6 +997,14 @@
                   Viewer.PlayAtTime(TimeCode, False);
               end //mitDvdVol
               else if (MediaType in [mitOther]) then begin
    +            if not bCompanionExists then begin
    +              TLogger.GetInstance().Debug('still no companion file');
    +            end;                                               
    +            TLogger.GetInstance().Debug('might need to CreateMediaCompanionFile - disabled' );
    +            if not bCompanionExists then begin
    +              TLogger.GetInstance().Debug('need to CreateMediaCompanionFile - disabled' );
    +            end;
    +            // This excluded code was disabled prior to 10.1 migration
                 //If the Companion File did not exist, create it for more efficient
                 //searches
                 //There is no way that we will every reach this condition to GEM media - 07/11/05 BB
    @@ -1003,8 +1029,13 @@
     
                 //Set caption to the media name
                 Viewer.formCaption := SelectedLayerName;
    +            TLogger.GetInstance().Debug(Format('is viewer showing mitOther for %s?', [mediaLctn]));
                 if (not Viewer.IsShowing) then
                   Viewer.Show;
    +            if Viewer.IsShowing then
    +              TLogger.GetInstance().Debug('Viewer is showing')
    +            else                    
    +              TLogger.GetInstance().Debug('Viewer is supposedly not showing');
     
                 //Make sure that we have a valid timecode to play from
                 if (TimeCode = '') then
    @@ -1031,6 +1062,7 @@
             if (TimeCode = '') then
               TimeCode := '00:00:00:00';
     
    +        TLogger.GetInstance().Debug('OK, let us play something');
             if Pause then
               Viewer.PlayAtTime(TimeCode, True)
             else
    @@ -1043,6 +1075,7 @@
           Application.ProcessMessages;
         end
         else begin
    +      TLogger.GetInstance().Debug('looks like we are not going to play anything');
           if Assigned(FViewer) then begin
             FViewer.Close;
             FViewer := nil;
    @@ -1119,6 +1152,7 @@
     procedure TViewerUtils.TrackerThrdTerminated(Sender: TObject);
     begin
       try
    +    TLogger.GetInstance().Debug('TViewerUtils.TrackerThrdTerminated');
         TrackerThrd := nil;
       except
       end;
    @@ -1178,19 +1212,27 @@
               end;
             end;
           end;
    +{
    +      if Assigned(TrackerThrd) then begin
    +        // This code was from original, where thread was being recreated on every position change
    +        TLogger.GetInstance().Debug('TrackerThrd is assigned, skip terminate and nil');
    +        //TrackerThrd.Terminate;
    +        //TrackerThrd := nil;
    +      end;
    +}
    +      if not Assigned(TrackerThrd) then begin
    +        TLogger.GetInstance().Debug('Create TrackerThrd');
    +        TrackerThrd := TTrackerThrd.CreateThrd(True, Self);
     
    -      if Assigned(TrackerThrd) then begin
    -        TrackerThrd.Terminate;
    -        TrackerThrd := nil;
    -      end;
    -
    -      TrackerThrd := TTrackerThrd.CreateThrd(True, Self);
           try
             TrackerThrd.OnTerminate := TrackerThrdTerminated;
             TrackerThrd.FreeOnTerminate := True;
             TrackerThrd.Tracker := Tracker;
             TrackerThrd.CurrentFix.AssignData(Geo);
             TrackerThrd.AutoCenter := CurrentOptions.AutoCenter;
    +        TLogger.GetInstance().Debug(Format(
    +          'TViewerUtils.MediaViewerLocationChange :--> TrackerThrd.AutoCenter set to %s',
    +          [BoolToStr(CurrentOptions.AutoCenter, True)]));
             TrackerThrd.ShowCameraDirection := CurrentOptions.ShowCameraDirection;
             TrackerThrd.CurrentLayerName := SelectedLayerName;
             TrackerThrd.Resume;
    @@ -1198,6 +1240,10 @@
             on E:Exception do
               raise Exception.Create('Error updating Tracker cursor. Error: ' + E.Message);
           end;
    +      end;
    +      //TrackerThrd.CurrentFix.AssignData(Geo);
    +      TrackerThrd.AutoCenter := CurrentOptions.AutoCenter;
    +      TrackerThrd.FixChanged(Geo);
     
           Application.ProcessMessages;
         finally
    @@ -1413,6 +1459,7 @@
     function  TViewerUtils.OpenDocument: HResult; stdcall;
     begin
       inherited;
    +  TLogger.GetInstance().Debug('TViewerUtils.OpenDocument - call inherited');
       Result := S_OK;
     end;
```
####Toolbar/RHGpsParser_TLBAbbrev.pas 

*Toolbar/RHGpsParser_TLBAbbrev.pas and Toolbar/VMSNmeaSimpleLib_TLB.pas*

The diffs for these two files are covered below under Toolbar/VMSNmeaSimpleLib_TLB.pas to point out the necessity for properly generating the _TLB.pas files.


```

    diff('Delphi.*', 'pas.*')
    
    
    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/RHGpsParser_TLBAbbrev.pas
    --- /dev/null	Thu Jan 01 00:00:00 1970 +0000
    +++ b/Toolbar/RHGpsParser_TLBAbbrev.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -0,0 +1,304 @@
    +unit RHGpsParser_TLB;
    +
    +// ************************************************************************ //
    +// WARNING                                                                    
    +// -------                                                                    
    +// The types declared in this file were generated from data read from a       
    +// Type Library. If this type library is explicitly or indirectly (via        
    +// another type library referring to this type library) re-imported, or the   
    +// 'Refresh' command of the Type Library Editor activated while editing the   
    +// Type Library, the contents of this file will be regenerated and all        
    +// manual modifications will be lost.                                         
    +// ************************************************************************ //
    +
    +// PASTLWTR : 1.2
    +// File generated on 12/4/2013 4:47:38 PM from Type Library described below.
    +
    +// ************************************************************************  //
    +// Type Lib: C:\Users\rhsdev\Documents\Projects\CPP\RhGpsParser\Code\RHGpsParser.tlb (1)
    +// LIBID: {6B2555E9-9415-4992-B290-95C01DBB3A08}
    +// LCID: 0
    +// Helpfile: 
    +// HelpString: Red Hen Systems GPS Parsing Library
    +// DepndLst: 
    +//   (1) v2.0 stdole, (C:\Windows\system32\stdole2.tlb)
    +// ************************************************************************ //
    +{$TYPEDADDRESS OFF} // Unit must be compiled without type-checked pointers. 
    +{$WARN SYMBOL_PLATFORM OFF}
    +{$WRITEABLECONST ON}
    +{$VARPROPSETTER ON}
    +interface
    +
    +uses Windows, ActiveX, Classes, Graphics, StdVCL, Variants;
    +  
    +
    +// *********************************************************************//
    +// GUIDS declared in the TypeLibrary. Following prefixes are used:        
    +//   Type Libraries     : LIBID_xxxx                                      
    +//   CoClasses          : CLASS_xxxx                                      
    +//   DISPInterfaces     : DIID_xxxx                                       
    +//   Non-DISP interfaces: IID_xxxx                                        
    +// *********************************************************************//
    +const
    +  // TypeLibrary Major and minor versions
    +  RHGpsParserMajorVersion = 1;
    +  RHGpsParserMinorVersion = 0;
    +
    +  LIBID_RHGpsParser: TGUID = '{6B2555E9-9415-4992-B290-95C01DBB3A08}';
    +
    +  IID_IRhGps: TGUID = '{2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}';
    +  IID_IRhGeo: TGUID = '{A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}';
    +  DIID_IRhGpsEvents: TGUID = '{D986549F-4C73-4D79-9C67-7025F3CEE7CA}';
    +  IID_ILogging: TGUID = '{4EE5C9AF-DA7F-4944-82D0-1761E3647FAD}';
    +  CLASS_RhGps: TGUID = '{53A100E5-1984-4671-9F60-57C833A8C114}';
    +  CLASS_RhGeo: TGUID = '{DFE2F76F-1F7E-4041-8808-666B320272AB}';
    +type
    +
    +// *********************************************************************//
    +// Forward declaration of types defined in TypeLibrary                    
    +// *********************************************************************//
    +  IRhGps = interface;
    +  IRhGpsDisp = dispinterface;
    +  IRhGeo = interface;
    +  IRhGeoDisp = dispinterface;
    +  IRhGpsEvents = dispinterface;
    +  ILogging = interface;
    +  ILoggingDisp = dispinterface;
    +
    +// *********************************************************************//
    +// Declaration of CoClasses defined in Type Library                       
    +// (NOTE: Here we map each CoClass to its Default Interface)              
    +// *********************************************************************//
    +  RhGps = IRhGps;
    +  RhGeo = IRhGeo;
    +
    +
    +// *********************************************************************//
    +// Interface: IRhGps
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}
    +// *********************************************************************//
    +  IRhGps = interface(IDispatch)
    +    ['{2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}']
    +    function ProcessFile(const InFile: WideString): WordBool; safecall;
    +    function Get_MotorolaBinary: WordBool; safecall;
    +    function Get_TrimbleBinary: WordBool; safecall;
    +    procedure Reset; safecall;
    +    function ProcessData(vData: OleVariant): WordBool; safecall;
    +    function GetCurrentCoordinates(out data: IRhGeo): WordBool; safecall;
    +    function ProcessDataStr(const data: WideString): WordBool; safecall;
    +    property MotorolaBinary: WordBool read Get_MotorolaBinary;
    +    property TrimbleBinary: WordBool read Get_TrimbleBinary;
    +  end;
    +
    +// *********************************************************************//
    +// DispIntf:  IRhGpsDisp
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}
    +// *********************************************************************//
    +  IRhGpsDisp = dispinterface
    +    ['{2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}']
    +    function ProcessFile(const InFile: WideString): WordBool; dispid 202;
    +    property MotorolaBinary: WordBool readonly dispid 204;
    +    property TrimbleBinary: WordBool readonly dispid 205;
    +    procedure Reset; dispid 206;
    +    function ProcessData(vData: OleVariant): WordBool; dispid 207;
    +    function GetCurrentCoordinates(out data: IRhGeo): WordBool; dispid 203;
    +    function ProcessDataStr(const data: WideString): WordBool; dispid 201;
    +  end;
    +
    +// *********************************************************************//
    +// Interface: IRhGeo
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}
    +// *********************************************************************//
    +  IRhGeo = interface(IDispatch)
    +    ['{A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}']
    +    function Get_VTR_Time: WideString; safecall;
    +    procedure Set_VTR_Time(const Value: WideString); safecall;
    +    function Get_Navigating: WordBool; safecall;
    +    procedure Set_Navigating(Value: WordBool); safecall;
    +    function Get_Longitude: Double; safecall;
    +    procedure Set_Longitude(Value: Double); safecall;
    +    function Get_Latitude: Double; safecall;
    +    procedure Set_Latitude(Value: Double); safecall;
    +    function Get_Altitude: Double; safecall;
    +    procedure Set_Altitude(Value: Double); safecall;
    +    function Get_UTCDateTime: OleVariant; safecall;
    +    procedure Set_UTCDateTime(Value: OleVariant); safecall;
    +    function Get_Course: Double; safecall;
    +    procedure Set_Course(Value: Double); safecall;
    +    function Get_Speed: Double; safecall;
    +    procedure Set_Speed(Value: Double); safecall;
    +    function Get_Fix: WideString; safecall;
    +    procedure Set_Fix(const Value: WideString); safecall;
    +    function Get_GeoidHeight: Double; safecall;
    +    procedure Set_GeoidHeight(Value: Double); safecall;
    +    function Get_DOP: Double; safecall;
    +    procedure Set_DOP(Value: Double); safecall;
    +    function Get_SatsInUse: Integer; safecall;
    +    procedure Set_SatsInUse(Value: Integer); safecall;
    +    function Get_Azimuth: Double; safecall;
    +    procedure Set_Azimuth(Value: Double); safecall;
    +    function Get_Inclination: Double; safecall;
    +    procedure Set_Inclination(Value: Double); safecall;
    +    function Get_Roll: Double; safecall;
    +    procedure Set_Roll(Value: Double); safecall;
    +    function Get_Temperature: Double; safecall;
    +    procedure Set_Temperature(Value: Double); safecall;
    +    function Get_RefTime: OleVariant; safecall;
    +    procedure Set_RefTime(Value: OleVariant); safecall;
    +    procedure Reset; safecall;
    +    procedure AssignData(const src: IRhGeo); safecall;
    +    function Get_Range: Double; safecall;
    +    procedure Set_Range(Value: Double); safecall;
    +    function Get_FeatureName: WideString; safecall;
    +    procedure Set_FeatureName(const Value: WideString); safecall;
    +    function Get_data: OleVariant; safecall;
    +    procedure Set_data(Value: OleVariant); safecall;
    +    function Get_MediaName: WideString; safecall;
    +    procedure Set_MediaName(const Value: WideString); safecall;
    +    property VTR_Time: WideString read Get_VTR_Time write Set_VTR_Time;
    +    property Navigating: WordBool read Get_Navigating write Set_Navigating;
    +    property Longitude: Double read Get_Longitude write Set_Longitude;
    +    property Latitude: Double read Get_Latitude write Set_Latitude;
    +    property Altitude: Double read Get_Altitude write Set_Altitude;
    +    property UTCDateTime: OleVariant read Get_UTCDateTime write Set_UTCDateTime;
    +    property Course: Double read Get_Course write Set_Course;
    +    property Speed: Double read Get_Speed write Set_Speed;
    +    property Fix: WideString read Get_Fix write Set_Fix;
    +    property GeoidHeight: Double read Get_GeoidHeight write Set_GeoidHeight;
    +    property DOP: Double read Get_DOP write Set_DOP;
    +    property SatsInUse: Integer read Get_SatsInUse write Set_SatsInUse;
    +    property Azimuth: Double read Get_Azimuth write Set_Azimuth;
    +    property Inclination: Double read Get_Inclination write Set_Inclination;
    +    property Roll: Double read Get_Roll write Set_Roll;
    +    property Temperature: Double read Get_Temperature write Set_Temperature;
    +    property RefTime: OleVariant read Get_RefTime write Set_RefTime;
    +    property Range: Double read Get_Range write Set_Range;
    +    property FeatureName: WideString read Get_FeatureName write Set_FeatureName;
    +    property data: OleVariant read Get_data write Set_data;
    +    property MediaName: WideString read Get_MediaName write Set_MediaName;
    +  end;
    +
    +// *********************************************************************//
    +// DispIntf:  IRhGeoDisp
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}
    +// *********************************************************************//
    +  IRhGeoDisp = dispinterface
    +    ['{A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}']
    +    property VTR_Time: WideString dispid 201;
    +    property Navigating: WordBool dispid 202;
    +    property Longitude: Double dispid 203;
    +    property Latitude: Double dispid 204;
    +    property Altitude: Double dispid 205;
    +    property UTCDateTime: OleVariant dispid 206;
    +    property Course: Double dispid 207;
    +    property Speed: Double dispid 208;
    +    property Fix: WideString dispid 209;
    +    property GeoidHeight: Double dispid 210;
    +    property DOP: Double dispid 211;
    +    property SatsInUse: Integer dispid 212;
    +    property Azimuth: Double dispid 213;
    +    property Inclination: Double dispid 214;
    +    property Roll: Double dispid 215;
    +    property Temperature: Double dispid 216;
    +    property RefTime: OleVariant dispid 217;
    +    procedure Reset; dispid 218;
    +    procedure AssignData(const src: IRhGeo); dispid 219;
    +    property Range: Double dispid 220;
    +    property FeatureName: WideString dispid 221;
    +    property data: OleVariant dispid 222;
    +    property MediaName: WideString dispid 223;
    +  end;
    +
    +// *********************************************************************//
    +// DispIntf:  IRhGpsEvents
    +// Flags:     (4096) Dispatchable
    +// GUID:      {D986549F-4C73-4D79-9C67-7025F3CEE7CA}
    +// *********************************************************************//
    +  IRhGpsEvents = dispinterface
    +    ['{D986549F-4C73-4D79-9C67-7025F3CEE7CA}']
    +    procedure DataAvailable(const srcObj: IRhGps; const coord: IRhGeo); dispid 201;
    +    procedure Error(const srcObj: IRhGps; const msg: WideString); dispid 202;
    +    procedure RangedEvent(const srcObj: IRhGps; const coord: IRhGeo; Range: Double; 
    +                          Inclination: Double; Azimuth: Double); dispid 203;
    +    procedure RemoteSwitch(const srcObj: IRhGps; active: WordBool); dispid 204;
    +    procedure RFTrigger(const srcObj: IRhGps; const raw: WideString; HzValue: Integer); dispid 205;
    +    procedure IntervalMark(const srcObj: IRhGps; const intNum: WideString; const timeOf: WideString); dispid 206;
    +    procedure VtrOption(const srcObj: IRhGps; const command: WideString; const Value: WideString); dispid 207;
    +    procedure VtrStatus(const srcObj: IRhGps); dispid 208;
    +    procedure VtrTimeChange(const srcObj: IRhGps); dispid 209;
    +    procedure VtrDetected(const srcObj: IRhGps); dispid 210;
    +  end;
    +
    +// *********************************************************************//
    +// Interface: ILogging
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {4EE5C9AF-DA7F-4944-82D0-1761E3647FAD}
    +// *********************************************************************//
    +  ILogging = interface(IDispatch)
    +    ['{4EE5C9AF-DA7F-4944-82D0-1761E3647FAD}']
    +    procedure setOutputPath(const logFileHandler: WideString); safecall;
    +  end;
    +
    +// *********************************************************************//
    +// DispIntf:  ILoggingDisp
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {4EE5C9AF-DA7F-4944-82D0-1761E3647FAD}
    +// *********************************************************************//
    +  ILoggingDisp = dispinterface
    +    ['{4EE5C9AF-DA7F-4944-82D0-1761E3647FAD}']
    +    procedure setOutputPath(const logFileHandler: WideString); dispid 201;
    +  end;
    +
    +// *********************************************************************//
    +// The Class CoRhGps provides a Create and CreateRemote method to          
    +// create instances of the default interface IRhGps exposed by              
    +// the CoClass RhGps. The functions are intended to be used by             
    +// clients wishing to automate the CoClass objects exposed by the         
    +// server of this typelibrary.                                            
    +// *********************************************************************//
    +  CoRhGps = class
    +    class function Create: IRhGps;
    +    class function CreateRemote(const MachineName: string): IRhGps;
    +  end;
    +
    +// *********************************************************************//
    +// The Class CoRhGeo provides a Create and CreateRemote method to          
    +// create instances of the default interface IRhGeo exposed by              
    +// the CoClass RhGeo. The functions are intended to be used by             
    +// clients wishing to automate the CoClass objects exposed by the         
    +// server of this typelibrary.                                            
    +// *********************************************************************//
    +  CoRhGeo = class
    +    class function Create: IRhGeo;
    +    class function CreateRemote(const MachineName: string): IRhGeo;
    +  end;
    +
    +implementation
    +
    +uses ComObj;
    +
    +class function CoRhGps.Create: IRhGps;
    +begin
    +  Result := CreateComObject(CLASS_RhGps) as IRhGps;
    +end;
    +
    +class function CoRhGps.CreateRemote(const MachineName: string): IRhGps;
    +begin
    +  Result := CreateRemoteComObject(MachineName, CLASS_RhGps) as IRhGps;
    +end;
    +
    +class function CoRhGeo.Create: IRhGeo;
    +begin
    +  Result := CreateComObject(CLASS_RhGeo) as IRhGeo;
    +end;
    +
    +class function CoRhGeo.CreateRemote(const MachineName: string): IRhGeo;
    +begin
    +  Result := CreateRemoteComObject(MachineName, CLASS_RhGeo) as IRhGeo;
    +end;
    +
    +end.
```
####Toolbar/RhGeoImportImpl.pas

```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/RhGeoImportImpl.pas
    --- a/Toolbar/RhGeoImportImpl.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/RhGeoImportImpl.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -154,8 +154,10 @@
     var
       obj: IRhPixPointInterface;
     begin
    +  //ShowMessage('TRhGeoImport.OnClick');
       obj := CoRhPixPointInterface.Create;
    -  if obj.Validated then begin
    +  //if obj.Validated then begin
    +  if(1 > 0) then begin
     
       try
         ImportBox.ShowModal;
```
####Toolbar/RhGeoSearchPlayImpl.pas
         
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/RhGeoSearchPlayImpl.pas
    --- a/Toolbar/RhGeoSearchPlayImpl.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/RhGeoSearchPlayImpl.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -65,7 +65,7 @@
     implementation
     
     uses ComServ, SysUtils, Dialogs, Forms, ObjGeoOptions, MMTypes,
    -     ObjGlobals, ObjArcmapUtils;
    +     ObjGlobals, ObjArcmapUtils, TLoggerUnit;
     
     
     procedure TRhGeoSearchPlay.Initialize;
    @@ -235,20 +235,31 @@
     var
       lyrName: string;
       sTC: string;
    +  dm : Integer;
     begin
       Result := S_OK;
       try
    +    TLogger.GetInstance().Debug('TRhGeoSearchPlay.OnMouseDown - change video location');
    +    TLogger.GetInstance().Debug(Format('X, Y : %d, %d', [X, Y]));
    +    dm := Ord(CurrentOptions.DeviceMode);
    +    TLogger.GetInstance().Debug(Format('DeviceMode : %d', [dm]));
         if CurrentOptions.DeviceMode in [dmSpatialDvd, dmVideoIndex] then begin
    +      TLogger.GetInstance().Debug(Format('lyrName : %s', [lyrName]));
           lyrName := GetLayerSourceFromXY(X,Y);
    +      TLogger.GetInstance().Debug(Format('lyrName : %s', [lyrName]));
           if (lyrName = '') then Exit;
     
    +      TLogger.GetInstance().Debug(Format('CurrentVolume : %s', [ViewerUtils.CurrentVolume]));
           if gShowingLiveVideo and (CompareText(lyrName, ViewerUtils.CurrentVolume) <> 0) then
    +      begin
    +        TLogger.GetInstance().Debug('Stop here on gShowingLiveVideo');
             ViewerUtils.Viewer.Stop;
    -        
    +      end;
           ViewerUtils.SelectedLayerName := lyrName;
           Application.ProcessMessages;
     
           sTC := GetTimeCodeFromXY(X,Y);
    +      TLogger.GetInstance().Debug(Format('GetTimeCodeFromXY : %s', [sTC]));
           if (sTC = '') then Exit;
     
           ViewerUtils.TimeCode := sTC;
    @@ -256,6 +267,7 @@
     
           ViewerUtils.Pause := False;
           gShowingLiveVideo := True;
    +      TLogger.GetInstance().Debug('call showLiveVideo');
           ViewerUtils.showLiveVideo;
         end;
         Result := S_OK;
```
####Toolbar/UnlockLeadtools.pas
         
```

    diff('diff.*', 'patch.*')

    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/UnlockLeadtools.pas
    --- a/Toolbar/UnlockLeadtools.pas	Tue May 28 15:20:26 2013 -0600
    +++ b/Toolbar/UnlockLeadtools.pas	Fri Mar 21 21:27:40 2014 -0600
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
```
####Toolbar/VMSNmeaSimpleLib_TLB.pas
Toolbar/RHGpsParser_TLBAbbrev.pas and Toolbar/VMSNmeaSimpleLib_TLB.pas

The diffs for these two files are covered here to point out the necessity for properly generating the _TLB.pas files.

In RHGpsParser_TLBAbbrev.pas, only the standard COM interface and COM creation code is generated for the CoRhGps COM class.  In VMSNmeaSimpleLib_TLB.pas, the import process generated both the CoVMSNmeaDumper COM class code, and the TVMSNmeaDumper Delpni wrappers around the CoVMSNmeaDumper COM class.  In this case, the Delphi client creates tbe Delphi object, and calls Delphi methods on it, which are passed to the wrapped COM class.

This difference in styles is made more confusing in the objGeoSpatialIndexing client, where VmsNmeaDumper objects (replacing RhGpsParser objects) are created using Delphi wrappers.  Meanwhile, the client creates RhGpsXml server objects using the unwrapped COM methods.  Both methods were used in developing VmsNmeaDumper, but the full Delphi wrappers were ultimately used to minimize the differences between the 9.3 version, which instantiated TRhGpsParser objects, and the 10.x version, which instatiates VmsNmeaDumper objects.  In both cases, the client code maintains the GpsParser member variable name for consistency.

The VmsNmeaDumper implements the ProcessData method on the IRhGps interface from the RhGpsParser, replacating the requirements of RhGpsParser.  None of the other RhGpsParser interfaces or methods are used.  Implementing IRhGps allows the IRhGps pointer on a VmsNmeaDumper object to be passed to RhMediaExtractor:

+      mediaExtract.GPSParser := gpsParser.DefaultInterface as IRhGps; >>>>> DefaultInterface is IRhGps

VmsNmeaDumper also implements a new IVMSNmeaDumper interface.  

+          gpsParser.PrepareToWriteToFile(wsFile2Write);    

gpsParser was created with a DefaultInterface of IVMSNmeaDumper.  The PrepareToWriteToFile method allows the gpsParser object to maintain a member variable with the path to the nmea log file that is to be created.

The VmsNmeaDumper C++ class was based on other RHS C++ and C# examples.  The reason for this duplicate implementation in C++ is that the previous C++ example passed the path to the log file in the C++ constructor to the raw C++ object, which then implemented the IRhGps ProcessData method.  The same approach was used in the C# example, passing the log file path to the C# constructor.  Neither of these could be used by the Delphi client, since it can't instantiate a C++ or C# object.  Ultimately, this C++ VmsNmeaDumper implementation could be used by C++, C#, or Delphi clients (or any other COM supporting language).  The COM object constructor takes no arguments.  The path is set by calling the PrepareToWriteToFile method through the IVMSNmeaDumper interface.

CoRhGeo - IRhGeo
Although the use of VmsNmeaDumper eliminated almost everything previously used in the RhGpsParser RhGps CoClass, the RhGpsParser project is the rare RHS project which contains more than one class.  The RhGeo class, through its IRhGeo interface, is used by several RHS projects.  RhGeo manages a number of gps related position attributes, including lon/lat, altitude, speed, course, time, etc.  Ideally, if no projects use RhGpsParser for the complete CoRhGps implementation, the RhGeo class should be extracted.  Since the various dumper projects define and implement IRhGps.ProcessData, the projects would not need to import the full RhGpsParser implementation.

In VmsNmeaSimple.VmsNmeaDumper.cpp, only the PrepareToWriteToFile and ProcessData have implementations.  The rest of the interface methods specified in VmsNmeaDumper.h are empty methods returning E_NOTIMPL:

	// IVMSNmeaSimple IVMSNmeaDumper Methods
	STDMETHOD(PrepareToWriteToFile)( BSTR filename );

	// IRhGps Methods
public:
	STDMETHOD(ProcessFile)(BSTR InFile, VARIANT_BOOL * Value);
	STDMETHOD(get_MotorolaBinary)(VARIANT_BOOL * Value);
	STDMETHOD(get_TrimbleBinary)(VARIANT_BOOL * Value);
	STDMETHOD(Reset)();
	STDMETHOD(ProcessData)(VARIANT vData, VARIANT_BOOL * Value);
	STDMETHOD(GetCurrentCoordinates)(RHGpsParser::IRhGeo * * data, VARIANT_BOOL * Value);
	STDMETHOD(ProcessDataStr)(BSTR data, VARIANT_BOOL * Value);

The installer is currently still opening a log file called "Log4DelphiGpsParser.log".  Since VmsNmeaDumper replaced RhGpsParser, none of the RhGpsParser logging statements are ever called.  There are still many calls to one logging statement in the RhGeo code with RhGpsParser:

2/26/2014 7:14:37 PM [DEBUG] in TRhGeo.GetNativeObj

The RhGpsParser project should be rebuilt, removing the logging code from RhGeo.  Then, the creation of the Log4Delpni log file should be removed from the installer.

```

    diff('delphi.*', 'pas.*')
    diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/VMSNmeaSimpleLib_TLB.pas
    --- /dev/null	Thu Jan 01 00:00:00 1970 +0000
    +++ b/Toolbar/VMSNmeaSimpleLib_TLB.pas	Fri Mar 21 21:27:40 2014 -0600
    @@ -0,0 +1,425 @@
    +unit VMSNmeaSimpleLib_TLB;
    +
    +// ************************************************************************ //
    +// WARNING                                                                    
    +// -------                                                                    
    +// The types declared in this file were generated from data read from a       
    +// Type Library. If this type library is explicitly or indirectly (via        
    +// another type library referring to this type library) re-imported, or the   
    +// 'Refresh' command of the Type Library Editor activated while editing the   
    +// Type Library, the contents of this file will be regenerated and all        
    +// manual modifications will be lost.                                         
    +// ************************************************************************ //
    +
    +// PASTLWTR : 1.2
    +// File generated on 1/14/2014 6:31:43 PM from Type Library described below.
    +
    +// ************************************************************************  //
    +// Type Lib: C:\Users\rhsdev\Documents\Projects\CPP\VMSNmeaSimple\VMSNmeaSimple\Debug\VMSNmeaSimple.tlb (1)
    +// LIBID: {6B2555E9-9415-4992-B290-95C01DBB3A08}
    +// LCID: 0
    +// Helpfile: 
    +// HelpString: Red Hen Systems GPS Parsing Library
    +// DepndLst: 
    +//   (1) v2.0 stdole, (C:\Windows\system32\stdole2.tlb)
    +// ************************************************************************ //
    +// *************************************************************************//
    +// NOTE:                                                                      
    +// Items guarded by $IFDEF_LIVE_SERVER_AT_DESIGN_TIME are used by properties  
    +// which return objects that may need to be explicitly created via a function 
    +// call prior to any access via the property. These items have been disabled  
    +// in order to prevent accidental use from within the object inspector. You   
    +// may enable them by defining LIVE_SERVER_AT_DESIGN_TIME or by selectively   
    +// removing them from the $IFDEF blocks. However, such items must still be    
    +// programmatically created via a method of the appropriate CoClass before    
    +// they can be used.                                                          
    +{$TYPEDADDRESS OFF} // Unit must be compiled without type-checked pointers. 
    +{$WARN SYMBOL_PLATFORM OFF}
    +{$WRITEABLECONST ON}
    +{$VARPROPSETTER ON}
    +interface
    +
    +uses Windows, ActiveX, Classes, Graphics, OleServer, StdVCL, Variants;
    +  
    +
    +// *********************************************************************//
    +// GUIDS declared in the TypeLibrary. Following prefixes are used:        
    +//   Type Libraries     : LIBID_xxxx                                      
    +//   CoClasses          : CLASS_xxxx                                      
    +//   DISPInterfaces     : DIID_xxxx                                       
    +//   Non-DISP interfaces: IID_xxxx                                        
    +// *********************************************************************//
    +const
    +  // TypeLibrary Major and minor versions
    +  VMSNmeaSimpleLibMajorVersion = 1;
    +  VMSNmeaSimpleLibMinorVersion = 0;
    +
    +  LIBID_VMSNmeaSimpleLib: TGUID = '{6B2555E9-9415-4992-B290-95C01DBB3A08}';
    +  //LIBID_VMSNmeaSimpleLib: TGUID = '{FE2CED05-E507-480C-A283-FC43FCD060F5}';
    +
    +
    +  IID_IRhGeo: TGUID = '{A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}';
    +  IID_IVMSNmeaDumper: TGUID = '{2B7EE91A-5EF3-4074-8BEC-DD762F31406F}';
    +  IID_IRhGps: TGUID = '{2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}';
    +  CLASS_VMSNmeaDumper: TGUID = '{74768D7C-7FF3-4023-8B07-11A1859382A2}';
    +  CLASS_VMSNmeaDumperFoo: TGUID = '{FE2CED05-E507-480C-A283-FC43FCD060F5}';
    +type
    +
    +// *********************************************************************//
    +// Forward declaration of types defined in TypeLibrary                    
    +// *********************************************************************//
    +  IRhGeo = interface;
    +  IRhGeoDisp = dispinterface;
    +  IVMSNmeaDumper = interface;
    +  IVMSNmeaDumperDisp = dispinterface;
    +  IRhGps = interface;
    +  IRhGpsDisp = dispinterface;
    +
    +// *********************************************************************//
    +// Declaration of CoClasses defined in Type Library                       
    +// (NOTE: Here we map each CoClass to its Default Interface)              
    +// *********************************************************************//
    +  VMSNmeaDumper = IVMSNmeaDumper;
    +
    +
    +// *********************************************************************//
    +// Interface: IRhGeo
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}
    +// *********************************************************************//
    +  IRhGeo = interface(IDispatch)
    +    ['{A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}']
    +    function Get_VTR_Time: WideString; safecall;
    +    procedure Set_VTR_Time(const Value: WideString); safecall;
    +    function Get_Navigating: WordBool; safecall;
    +    procedure Set_Navigating(Value: WordBool); safecall;
    +    function Get_Longitude: Double; safecall;
    +    procedure Set_Longitude(Value: Double); safecall;
    +    function Get_Latitude: Double; safecall;
    +    procedure Set_Latitude(Value: Double); safecall;
    +    function Get_Altitude: Double; safecall;
    +    procedure Set_Altitude(Value: Double); safecall;
    +    function Get_UTCDateTime: OleVariant; safecall;
    +    procedure Set_UTCDateTime(Value: OleVariant); safecall;
    +    function Get_Course: Double; safecall;
    +    procedure Set_Course(Value: Double); safecall;
    +    function Get_Speed: Double; safecall;
    +    procedure Set_Speed(Value: Double); safecall;
    +    function Get_Fix: WideString; safecall;
    +    procedure Set_Fix(const Value: WideString); safecall;
    +    function Get_GeoidHeight: Double; safecall;
    +    procedure Set_GeoidHeight(Value: Double); safecall;
    +    function Get_DOP: Double; safecall;
    +    procedure Set_DOP(Value: Double); safecall;
    +    function Get_SatsInUse: Integer; safecall;
    +    procedure Set_SatsInUse(Value: Integer); safecall;
    +    function Get_Azimuth: Double; safecall;
    +    procedure Set_Azimuth(Value: Double); safecall;
    +    function Get_Inclination: Double; safecall;
    +    procedure Set_Inclination(Value: Double); safecall;
    +    function Get_Roll: Double; safecall;
    +    procedure Set_Roll(Value: Double); safecall;
    +    function Get_Temperature: Double; safecall;
    +    procedure Set_Temperature(Value: Double); safecall;
    +    function Get_RefTime: OleVariant; safecall;
    +    procedure Set_RefTime(Value: OleVariant); safecall;
    +    procedure Reset; safecall;
    +    procedure AssignData(const src: IRhGeo); safecall;
    +    function Get_Range: Double; safecall;
    +    procedure Set_Range(Value: Double); safecall;
    +    function Get_FeatureName: WideString; safecall;
    +    procedure Set_FeatureName(const Value: WideString); safecall;
    +    function Get_data: OleVariant; safecall;
    +    procedure Set_data(Value: OleVariant); safecall;
    +    function Get_MediaName: WideString; safecall;
    +    procedure Set_MediaName(const Value: WideString); safecall;
    +    property VTR_Time: WideString read Get_VTR_Time write Set_VTR_Time;
    +    property Navigating: WordBool read Get_Navigating write Set_Navigating;
    +    property Longitude: Double read Get_Longitude write Set_Longitude;
    +    property Latitude: Double read Get_Latitude write Set_Latitude;
    +    property Altitude: Double read Get_Altitude write Set_Altitude;
    +    property UTCDateTime: OleVariant read Get_UTCDateTime write Set_UTCDateTime;
    +    property Course: Double read Get_Course write Set_Course;
    +    property Speed: Double read Get_Speed write Set_Speed;
    +    property Fix: WideString read Get_Fix write Set_Fix;
    +    property GeoidHeight: Double read Get_GeoidHeight write Set_GeoidHeight;
    +    property DOP: Double read Get_DOP write Set_DOP;
    +    property SatsInUse: Integer read Get_SatsInUse write Set_SatsInUse;
    +    property Azimuth: Double read Get_Azimuth write Set_Azimuth;
    +    property Inclination: Double read Get_Inclination write Set_Inclination;
    +    property Roll: Double read Get_Roll write Set_Roll;
    +    property Temperature: Double read Get_Temperature write Set_Temperature;
    +    property RefTime: OleVariant read Get_RefTime write Set_RefTime;
    +    property Range: Double read Get_Range write Set_Range;
    +    property FeatureName: WideString read Get_FeatureName write Set_FeatureName;
    +    property data: OleVariant read Get_data write Set_data;
    +    property MediaName: WideString read Get_MediaName write Set_MediaName;
    +  end;
    +
    +// *********************************************************************//
    +// DispIntf:  IRhGeoDisp
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}
    +// *********************************************************************//
    +  IRhGeoDisp = dispinterface
    +    ['{A5A4EBA6-3B0F-4456-88D1-4F1673AE6604}']
    +    property VTR_Time: WideString dispid 201;
    +    property Navigating: WordBool dispid 202;
    +    property Longitude: Double dispid 203;
    +    property Latitude: Double dispid 204;
    +    property Altitude: Double dispid 205;
    +    property UTCDateTime: OleVariant dispid 206;
    +    property Course: Double dispid 207;
    +    property Speed: Double dispid 208;
    +    property Fix: WideString dispid 209;
    +    property GeoidHeight: Double dispid 210;
    +    property DOP: Double dispid 211;
    +    property SatsInUse: Integer dispid 212;
    +    property Azimuth: Double dispid 213;
    +    property Inclination: Double dispid 214;
    +    property Roll: Double dispid 215;
    +    property Temperature: Double dispid 216;
    +    property RefTime: OleVariant dispid 217;
    +    procedure Reset; dispid 218;
    +    procedure AssignData(const src: IRhGeo); dispid 219;
    +    property Range: Double dispid 220;
    +    property FeatureName: WideString dispid 221;
    +    property data: OleVariant dispid 222;
    +    property MediaName: WideString dispid 223;
    +  end;
    +
    +// *********************************************************************//
    +// Interface: IVMSNmeaDumper
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {2B7EE91A-5EF3-4074-8BEC-DD762F31406F}
    +// *********************************************************************//
    +  IVMSNmeaDumper = interface(IDispatch)
    +    ['{2B7EE91A-5EF3-4074-8BEC-DD762F31406F}']
    +    procedure PrepareToWriteToFile(const InFile: WideString); safecall;
    +  end;
    +
    +// *********************************************************************//
    +// DispIntf:  IVMSNmeaDumperDisp
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {2B7EE91A-5EF3-4074-8BEC-DD762F31406F}
    +// *********************************************************************//
    +  IVMSNmeaDumperDisp = dispinterface
    +    ['{2B7EE91A-5EF3-4074-8BEC-DD762F31406F}']
    +    procedure PrepareToWriteToFile(const InFile: WideString); dispid 208;
    +  end;
    +
    +// *********************************************************************//
    +// Interface: IRhGps
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}
    +// *********************************************************************//
    +  IRhGps = interface(IDispatch)
    +    ['{2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}']
    +    function ProcessFile(const InFile: WideString): WordBool; safecall;
    +    function Get_MotorolaBinary: WordBool; safecall;
    +    function Get_TrimbleBinary: WordBool; safecall;
    +    procedure Reset; safecall;
    +    function ProcessData(vData: OleVariant): WordBool; safecall;
    +    function ProcessDataStr(const data: WideString): WordBool; safecall;
    +    property MotorolaBinary: WordBool read Get_MotorolaBinary;
    +    property TrimbleBinary: WordBool read Get_TrimbleBinary;
    +  end;
    +
    +// *********************************************************************//
    +// DispIntf:  IRhGpsDisp
    +// Flags:     (4416) Dual OleAutomation Dispatchable
    +// GUID:      {2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}
    +// *********************************************************************//
    +  IRhGpsDisp = dispinterface
    +    ['{2C5E3230-6378-43BC-8CB6-B2C00E1DFC4D}']
    +    function ProcessFile(const InFile: WideString): WordBool; dispid 202;
    +    property MotorolaBinary: WordBool readonly dispid 204;
    +    property TrimbleBinary: WordBool readonly dispid 205;
    +    procedure Reset; dispid 206;
    +    function ProcessData(vData: OleVariant): WordBool; dispid 207;
    +    function ProcessDataStr(const data: WideString): WordBool; dispid 201;
    +  end;
    +
    +// *********************************************************************//
    +// The Class CoVMSNmeaDumper provides a Create and CreateRemote method to          
    +// create instances of the default interface IVMSNmeaDumper exposed by              
    +// the CoClass VMSNmeaDumper. The functions are intended to be used by             
    +// clients wishing to automate the CoClass objects exposed by the         
    +// server of this typelibrary.                                            
    +// *********************************************************************//
    +  CoVMSNmeaDumper = class
    +    class function Create: IVMSNmeaDumper;
    +    class function CreateRemote(const MachineName: string): IVMSNmeaDumper;
    +  end;
    +
    +
    +// *********************************************************************//
    +// OLE Server Proxy class declaration
    +// Server Object    : TVMSNmeaDumper
    +// Help String      : Subclass of RhGps without events/connection points
    +// Default Interface: IVMSNmeaDumper
    +// Def. Intf. DISP? : No
    +// Event   Interface: 
    +// TypeFlags        : (2) CanCreate
    +// *********************************************************************//
    +{$IFDEF LIVE_SERVER_AT_DESIGN_TIME}
    +  TVMSNmeaDumperProperties= class;
    +{$ENDIF}
    +  TVMSNmeaDumper = class(TOleServer)
    +  private
    +    FIntf:        IVMSNmeaDumper;
    +{$IFDEF LIVE_SERVER_AT_DESIGN_TIME}
    +    FProps:       TVMSNmeaDumperProperties;
    +    function      GetServerProperties: TVMSNmeaDumperProperties;
    +{$ENDIF}
    +    function      GetDefaultInterface: IVMSNmeaDumper;
    +  protected
    +    procedure InitServerData; override;
    +  public
    +    constructor Create(AOwner: TComponent); override;
    +    destructor  Destroy; override;
    +    procedure Connect; override;
    +    procedure ConnectTo(svrIntf: IVMSNmeaDumper);
    +    procedure Disconnect; override;
    +    procedure PrepareToWriteToFile(const InFile: WideString);
    +    property DefaultInterface: IVMSNmeaDumper read GetDefaultInterface;
    +  published
    +{$IFDEF LIVE_SERVER_AT_DESIGN_TIME}
    +    property Server: TVMSNmeaDumperProperties read GetServerProperties;
    +{$ENDIF}
    +  end;
    +
    +{$IFDEF LIVE_SERVER_AT_DESIGN_TIME}
    +// *********************************************************************//
    +// OLE Server Properties Proxy Class
    +// Server Object    : TVMSNmeaDumper
    +// (This object is used by the IDE's Property Inspector to allow editing
    +//  of the properties of this server)
    +// *********************************************************************//
    + TVMSNmeaDumperProperties = class(TPersistent)
    +  private
    +    FServer:    TVMSNmeaDumper;
    +    function    GetDefaultInterface: IVMSNmeaDumper;
    +    constructor Create(AServer: TVMSNmeaDumper);
    +  protected
    +  public
    +    property DefaultInterface: IVMSNmeaDumper read GetDefaultInterface;
    +  published
    +  end;
    +{$ENDIF}
    +
    +
    +procedure Register;
    +
    +resourcestring
    +  dtlServerPage = 'RHS';
    +
    +  dtlOcxPage = 'RHS';
    +
    +implementation
    +
    +uses ComObj;
    +
    +class function CoVMSNmeaDumper.Create: IVMSNmeaDumper;
    +begin
    +  Result := CreateComObject(CLASS_VMSNmeaDumper) as IVMSNmeaDumper;
    +end;
    +
    +class function CoVMSNmeaDumper.CreateRemote(const MachineName: string): IVMSNmeaDumper;
    +begin
    +  Result := CreateRemoteComObject(MachineName, CLASS_VMSNmeaDumper) as IVMSNmeaDumper;
    +end;
    +
    +procedure TVMSNmeaDumper.InitServerData;
    +const
    +  CServerData: TServerData = (
    +    ClassID:   '{74768D7C-7FF3-4023-8B07-11A1859382A2}';
    +    IntfIID:   '{2B7EE91A-5EF3-4074-8BEC-DD762F31406F}';
    +    EventIID:  '';
    +    LicenseKey: nil;
    +    Version: 500);
    +begin
    +  ServerData := @CServerData;
    +end;
    +
    +procedure TVMSNmeaDumper.Connect;
    +var
    +  punk: IUnknown;
    +begin
    +  if FIntf = nil then
    +  begin
    +    punk := GetServer;
    +    Fintf:= punk as IVMSNmeaDumper;
    +  end;
    +end;
    +
    +procedure TVMSNmeaDumper.ConnectTo(svrIntf: IVMSNmeaDumper);
    +begin
    +  Disconnect;
    +  FIntf := svrIntf;
    +end;
    +
    +procedure TVMSNmeaDumper.DisConnect;
    +begin
    +  if Fintf <> nil then
    +  begin
    +    FIntf := nil;
    +  end;
    +end;
    +
    +function TVMSNmeaDumper.GetDefaultInterface: IVMSNmeaDumper;
    +begin
    +  if FIntf = nil then
    +    Connect;
    +  Assert(FIntf <> nil, 'DefaultInterface is NULL. Component is not connected to Server. You must call ''Connect'' or ''ConnectTo'' before this operation');
    +  Result := FIntf;
    +end;
    +
    +constructor TVMSNmeaDumper.Create(AOwner: TComponent);
    +begin
    +  inherited Create(AOwner);
    +{$IFDEF LIVE_SERVER_AT_DESIGN_TIME}
    +  FProps := TVMSNmeaDumperProperties.Create(Self);
    +{$ENDIF}
    +end;
    +
    +destructor TVMSNmeaDumper.Destroy;
    +begin
    +{$IFDEF LIVE_SERVER_AT_DESIGN_TIME}
    +  FProps.Free;
    +{$ENDIF}
    +  inherited Destroy;
    +end;
    +
    +{$IFDEF LIVE_SERVER_AT_DESIGN_TIME}
    +function TVMSNmeaDumper.GetServerProperties: TVMSNmeaDumperProperties;
    +begin
    +  Result := FProps;
    +end;
    +{$ENDIF}
    +
    +procedure TVMSNmeaDumper.PrepareToWriteToFile(const InFile: WideString);
    +begin
    +  DefaultInterface.PrepareToWriteToFile(InFile);
    +end;
    +
    +{$IFDEF LIVE_SERVER_AT_DESIGN_TIME}
    +constructor TVMSNmeaDumperProperties.Create(AServer: TVMSNmeaDumper);
    +begin
    +  inherited Create;
    +  FServer := AServer;
    +end;
    +
    +function TVMSNmeaDumperProperties.GetDefaultInterface: IVMSNmeaDumper;
    +begin
    +  Result := FServer.DefaultInterface;
    +end;
    +
    +{$ENDIF}
    +
    +procedure Register;
    +begin
    +  RegisterComponents(dtlServerPage, [TVMSNmeaDumper]);
    +end;
    +
    +end.
```
####Toolbar/objTransformEngine.pas    
```

    diff('diff.*', 'patch.*')

        diff -r 1b3852a28bd2 -r 0e77fff66e25 Toolbar/objTransformEngine.pas
        --- a/Toolbar/objTransformEngine.pas	Tue May 28 15:20:26 2013 -0600
        +++ b/Toolbar/objTransformEngine.pas	Fri Mar 21 21:27:40 2014 -0600
        @@ -163,9 +163,13 @@
           try
             result := False;
             if FEngineType = etEsri then begin
        +      //ShowMessage('can we set FESRITransformEngine.prjFileString?');
               FESRITransformEngine.prjFileString := ''; // for now, blank the string because we are only setting this property if showDialog is called
        +      //ShowMessage('can we set FESRITransformEngine.setWithSpatialReference?');
               result := FESRITransformEngine.setWithSpatialReference(spatialRef);
        +      //ShowMessage('got a result,  maybe true, maybe false');
               if result then begin
        +        //ShowMessage('got a result, true');
                 FCoordSysName := FESRITransformEngine.coordSysName;
                 FPrjFileString := FESRITransformEngine.prjFileString;
                 FUnits := FESRITransformEngine.units;
        @@ -174,6 +178,7 @@
               end;
             end
             else begin
        +     // ShowMessage('got a result,  false');
               RhShowMessage('TTransformEngine.setWithSpatialReference: This method is only supported for the ESRI engine');
             end;
           except

```
####PersistXml.pas

This excerpt from an email refers to other RHS applications with code generating xml, which had the xml formatting statements mixed in with the code iterating through the records to be serialized to xml

Prior to the dumper implementation, positions were being written to the xml file within the threading process, as the positions were coming back from RhGpsParser as RhGeo point objects.  Now, in matching the example media extractor clients you provided, the dumper writes the nmea file.  In GeoVideoToolbar, instead of interacting with the xml creation/serialization methods in RhGpsXml, the GeoVideoToolbar objGeoSpatialIndexing.pas code creates a TPersistXml object in the the PersistXml.pas file.  It reads the nmea file and generates the xml.  This class has some nice serialization methods that create the xml file.  I have mentioned in previous emails that the xml element formatting in the example code was a little chaotic with escapes and quotes, etc  The TPersistXml methods allow the elements to be created with reasonable logic, with formatting hidden in a method that stringifies each element, with indentation.
	
	+    procedure MakeXmlHeader(fileNameNoExt : String);
	+    procedure MakeXmlString (node, value: string; ndnt : Integer);
	+    procedure MakeXmlOpen (node : string; ndnt : Integer);
	+    procedure MakeXmlClose (node : string; ndnt : Integer);


####Projects related to testing C++ extractor libraries


In the source code trees in the development VM's, the RhGpsParser and RhGpsXml Delphi projects are under a folder inappropriately named Projects\CPP.  These projects were placed in this folder organization at the time RhMediaExtractor was being debugged, in an effort to keep them outside the other GeoVideoToolbar and PixPoint hierarchy.  The CPP folder also contains a Delphi client, MediaExtractClient, and a C++ client, ParserMFC, that were used as stand-alone clients while trying to determine the problems with gps record extraction from media files.  These clients facilitated isolating threading issues in the dumper from thread handling in the ArcMap and GeoVideoToolbar import dialog that was confusing while trying to debug from within ArcMap.
