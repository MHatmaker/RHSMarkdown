
###Toolbar (PixPoint)

The change in component categories registration between 9.3 and 10.x was significant, involving the ESRIRegAsm.exe tool accessing the CATID file under the ArcGIS Common Files Desktop10.x configuraton folder.  In the ToolBar project, the RhRegUtils.pas code contains logic duplicating where ESRIRegAsm.exe places registry nodes and attributes.

####GMLArcMapToolbar.dpr

In order to get the categories registration functioning, the

    +  GMLArcMapToolbar_TLB in 'GMLArcMapToolbar_TLB.pas';

was moved from the first uses item in the project file to the last item.  In addition, the RhRegUtils.DllGetClassObject method was dropped from the exports list.  This was done early in the upgrade project.  With more knowledge of what is going on in categories registration, it might be possible to restore, simplify, or eliminate the RhRegUtils code.  Since it works now with the EsriRegAsm tool, and the GMLArcMapToolbar.ecfg in the CATID folder, it seems preferable to use the EsriRegAsm tool.  This might also be beneficial if the COM object is ever migrated to .net.

 exports
   RhRegUtils.DllGetClassObject,   **<<<<<< this line was dropped.**
@@ -30,6 +31,7 @@
   RhRegUtils.DllRegisterServer,
   RhRegUtils.DllUnregisterServer;
   

```

    diff('diff.*', 'patch.*')

    diff -r c4ce982fc00a -r 110243014bb6 GMLArcMapToolbar.dpr
    --- a/GMLArcMapToolbar.dpr	Mon Jun 10 12:59:21 2013 -0600
    +++ b/GMLArcMapToolbar.dpr	Sun Nov 03 12:30:28 2013 -0700
    @@ -1,8 +1,8 @@
     library GMLArcMapToolbar;
     
    +
     uses
       ComServ,
    -  GMLArcMapToolbar_TLB in 'GMLArcMapToolbar_TLB.pas',
       ObjToolbarExtension in 'ObjToolbarExtension.pas' {ToolbarExtension: CoClass},
       ObjToolbar in 'ObjToolbar.pas' {Toolbar: CoClass},
       RhShowImageImpl in 'RhShowImageImpl.pas' {ShowImageTool: CoClass},
    @@ -22,7 +22,8 @@
       RhSelectFieldsImpl in 'RhSelectFieldsImpl.pas' {SelectFields: CoClass},
       DlgSetViewer in 'DlgSetViewer.pas' {frmSetViewer},
       Ver32 in 'ver32.pas',
    -  RhRegUtils in 'RhRegUtils.pas';
    +  RhRegUtils in 'RhRegUtils.pas',
    +  GMLArcMapToolbar_TLB in 'GMLArcMapToolbar_TLB.pas';
     
     exports
       RhRegUtils.DllGetClassObject,
    @@ -30,6 +31,7 @@
       RhRegUtils.DllRegisterServer,
       RhRegUtils.DllUnregisterServer;
     
    +
     {$R *.TLB}
     {$R *.RES}
     {$R IMAGES.RES}
     .
```

###GMLArcMapToolbar_TLB.pas

note : based tlb.pas on path using PxPt instead of original PixPoint

```
    diff('diff.*', 'patch.*')

    diff -r c4ce982fc00a -r 110243014bb6 GMLArcMapToolbar_TLB.pas
    --- a/GMLArcMapToolbar_TLB.pas	Mon Jun 10 12:59:21 2013 -0600
    +++ b/GMLArcMapToolbar_TLB.pas	Sun Nov 03 12:30:28 2013 -0700
    @@ -11,21 +11,22 @@
     // manual modifications will be lost.                                         
     // ************************************************************************ //
     
    -// PASTLWTR : $Revision: 13 $
    -// File generated on 2/28/2006 10:21:29 AM from Type Library described below.
    +// PASTLWTR : 1.2
    +// File generated on 6/11/2013 7:46:43 PM from Type Library described below.
     
     // ************************************************************************ //
    -// Type Lib: C:\Projects\Pixpoint\Toolbar\GMLArcMapToolbar.tlb (1)
    -// IID\LCID: {E3E28384-BD6F-409C-A038-0CF4FC3A2514}\0
    +// Type Lib: C:\Users\rhsdev\Documents\Projects\PxPt\Toolbar\GMLArcMapToolbar.tlb (1)
    +// LIBID: {98101126-0151-4D6B-81F3-B19DF431BEA2}
    +// LCID: 0
     // Helpfile: 
    +// HelpString: GMLArcMapToolbar Library
     // DepndLst: 
    -//   (1) v2.0 stdole, (C:\WINDOWS\system32\stdole2.tlb)
    -//   (2) v1.0 esriSystem, (C:\Program Files\ArcGIS\com\esriSystem.olb)
    -//   (3) v1.0 esriArcMapUI, (C:\Program Files\ArcGIS\com\esriArcMapUI.olb)
    -//   (4) v1.0 esriSystemUI, (C:\Program Files\ArcGIS\com\esriSystemUI.olb)
    -//   (5) v4.0 StdVCL, (C:\WINDOWS\system32\stdvcl40.dll)
    +//   (1) v2.0 stdole, (C:\Windows\system32\stdole2.tlb)
     // ************************************************************************ //
     {$TYPEDADDRESS OFF} // Unit must be compiled without type-checked pointers. 
    +{$WARN SYMBOL_PLATFORM OFF}
    +{$WRITEABLECONST ON}
    +{$VARPROPSETTER ON}
     interface
     
     uses Windows, ActiveX, Classes, Graphics, OleServer, OleCtrls, StdVCL,
     
```
####ObjPixpointUtils.pas
```

    diff('diff.*', 'patch.*')

    diff -r c4ce982fc00a -r 110243014bb6 ObjPixpointUtils.pas
    --- a/ObjPixpointUtils.pas	Mon Jun 10 12:59:21 2013 -0600
    +++ b/ObjPixpointUtils.pas	Sun Nov 03 12:30:28 2013 -0700
    @@ -37,7 +37,7 @@
     implementation
     
     uses
    -  ComObj, SysUtils, Dialogs, Registry, Ver32, ObjGlobals, ObjArcmapUtils;
    +  ComObj, SysUtils, Dialogs, Registry, Ver32, ObjGlobals, ObjArcmapUtils, RhLaunchProcessingImpl;
     
     procedure ShowToolbarBrowser(Value: boolean);
     var

     