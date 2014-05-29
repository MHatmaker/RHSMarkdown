###RHArcImportTool

Modifications to three files.

The following notes refer to both RHImportToolGDBImpl.pas and RHImportToolShapeImpl.pas.

Eliminated uses section inclusion of ATGraRes_TLB.  The project had problems building with the dcu from 2006 in the dcu folder.  In addition, the lines:

var
-  pGraRes: GraphicRes;
+  //pGraRes: GraphicRes;

and

-  pGraRes :=  CoGraphicRes.create as GraphicRes;
+  //pGraRes :=  CoGraphicRes.create as GraphicRes;

plus some later changes reflect that the resource coming from ATGraRes_TLB was not available for storing in the FBitmap member variable:

-  FBitmap := pGraRes.GetBMP(resourceID);
+  FBitmap := nil; //pGraRes.GetBMP(resourceID);

This is probably due to the same problem noted in the FieldSelect.txt file.

pGraRes.GetBMP is probably hiding a call to LoadFromFile(iconPath), where the path under ArcGIS 10.1 is no longer valid.  The same solution should be possible in RhImportToolBDBImpl.pas.  The resource for the bitmap to pass back to the ArcMap extension could be accessed by using a LoadFromResourceName call.  The existing Images.res file would be updated to include a png or bitmap matching the one lost from ArcMap 9.3.  The proper bitmap might be found in the PixPoint user's guide in one of the screen captures.

####RHArcImportTool.dpr

Build required adding tlb to files in Project (.dpr)
```

	diff ('*.diff', '*.patch')

	diff -r 1d66e7194028 -r 3f1d6bddfa85 RHArcImportTool.dpr
	--- a/RHArcImportTool.dpr	Thu Jun 13 20:14:20 2013 -0600
	+++ b/RHArcImportTool.dpr	Thu Oct 31 13:15:41 2013 -0600
	@@ -14,7 +14,6 @@
   	RHGxContextMenuImpl in 'RHGxContextMenuImpl.pas' {RHGxContextMenuInterface: CoClass},
   	RHGxCreateShapeImpl in 'RHGxCreateShapeImpl.pas' {RHGxCreateShapeInterface: CoClass},
   	RHGxCreateGDBImpl in 'RHGxCreateGDBImpl.pas' {RHGxCreateGDBInterface: CoClass},
	-  esriCoreEvents in 'esriCoreEvents.pas',
   	RHGxAllFileFilterImpl in 'RHGxAllFileFilterImpl.pas' {RHGxAllFileFilterInterface: CoClass},
   	RhRegUtils in 'RhRegUtils.pas';

	@@ -24,7 +23,7 @@
   	RhRegUtils.DllRegisterServer,
   	RhRegUtils.DllUnregisterServer;
 
	-{$R *.TLB}
	+{$R RHArcImportTool.tlb}
 	{$R *.RES}
 	{$R IMAGES.RES}
 	{$R PIXPOINTICON.RES}

```
####RHImportToolGDBImpl.pas
Couldn't resolve ATGraRes_TLB.  The resource did not appear to be used.

```
 
	diff ('*.diff', '*.patch')
 
	diff -r 1d66e7194028 -r 3f1d6bddfa85 RHImportToolGDBImpl.pas
	--- a/RHImportToolGDBImpl.pas	Thu Jun 13 20:14:20 2013 -0600
	+++ b/RHImportToolGDBImpl.pas	Thu Oct 31 13:15:41 2013 -0600
	@@ -21,7 +21,8 @@
	 {$ENDIF}
 
	 uses
	-  ComObj, ActiveX, RHArcImportTool_TLB, StdVcl, Windows, ATGraRes_TLB,
	+  //ComObj, ActiveX, RHArcImportTool_TLB, StdVcl, Windows, ATGraRes_TLB,
	+  ComObj, ActiveX, RHArcImportTool_TLB, StdVcl, Windows,
	   Dialogs, Controls, Classes, Sysutils, FileCtrl, RHPixPoint_TLB,
	 {$IFDEF ARCMAP9}
	   esriFramework_TLB, esriCatalogUI_TLB, esriGeoDatabase_TLB, esriSystem_TLB,
	@@ -68,15 +69,15 @@
	 ////////////////////////////////////////////////////////////////////////////////
	 procedure TRHImportToolGDBInterface.Initialize;
	 var
	-  pGraRes: GraphicRes;
	+  //pGraRes: GraphicRes;
	   resourceID: integer;
	 begin
	   inherited Initialize;
	   FDialogModality := esriATModal;
	-  pGraRes :=  CoGraphicRes.create as GraphicRes;
	+  //pGraRes :=  CoGraphicRes.create as GraphicRes;
	   resourceID := 15122;
	-  FBitmap := pGraRes.GetBMP(resourceID);
	-  pGraRes := nil;
	+  FBitmap := nil; //pGraRes.GetBMP(resourceID);
	+  //pGraRes := nil;
	   FIconHandle := loadIcon(hInstance,'TOOLBOXICON');
	   objAppName := CoRHPixPointInterface.create;
	 end;
	diff -r 1d66e7194028 -r 3f1d6bddfa85 RHImportToolShapeImpl.pas
	--- a/RHImportToolShapeImpl.pas	Thu Jun 13 20:14:20 2013 -0600
	+++ b/RHImportToolShapeImpl.pas	Thu Oct 31 13:15:41 2013 -0600
	@@ -21,7 +21,7 @@
	 {$ENDIF}
	 
	 uses
	-  ComObj, ActiveX, RHArcImportTool_TLB, StdVcl, Windows, ATGraRes_TLB,
	+  ComObj, ActiveX, RHArcImportTool_TLB, StdVcl, Windows, esriGeoDatabase_TLB,
	   Dialogs, Controls, Classes, Sysutils, fileCtrl, RHPixPoint_TLB,
	 {$IFDEF ARCMAP9}
	   esriFramework_TLB, esriCatalogUI_TLB;
	@@ -65,15 +65,16 @@
	 ////////////////////////////////////////////////////////////////////////////////
	 procedure TRHImportToolShapeInterface.Initialize;
	 var
	-  pGraRes: GraphicRes;
	+  //pGraRes: GraphicRes;
	   resourceID: integer;
	 begin
	   inherited Initialize;
	   FDialogModality := esriATModal;
	-  pGraRes :=  CoGraphicRes.create as GraphicRes;
	+  //pGraRes :=  CoGraphicRes.create as GraphicRes;
	   resourceID := 15122;
	-  FBitmap := pGraRes.GetBMP(resourceID);
	-  pGraRes := nil;
	+  //FBitmap := pGraRes.GetBMP(resourceID);
	+  FBitmap := nil; //pGraRes.GetBMP(resourceID);
	+  //pGraRes := nil;
	   FIconHandle := loadIcon(hInstance,'TOOLBOXICON');
	   objAppName := CoRHPixPointInterface.create;
	 end;

```
####conversion.pas
Upgraded from GmlLib30_TLB to GmlLib40_TLB.
```
 
	diff ('*.diff', '*.patch')
	diff -r 1d66e7194028 -r 3f1d6bddfa85 conversion.pas
	--- a/conversion.pas	Thu Jun 13 20:14:20 2013 -0600
	+++ b/conversion.pas	Thu Oct 31 13:15:41 2013 -0600
	@@ -35,7 +35,7 @@
	 
	 implementation
	 
	-uses DlgProgressBar, RHFileUtils, comObj, GmlLib30_TLB;
	+uses DlgProgressBar, RHFileUtils, comObj, GmlLib40_TLB;
	 
	 ////////////////////////////////////////////////////////////////////////////////
	 function isLogFile(const filePath: string): boolean;
