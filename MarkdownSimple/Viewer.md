###Viewer
####DlgMediaViewer.pas
DlgMediaViewer.pas

The Leadtools libraries were upgraded from 13 to 14.5

    +  LeadDef, LEADTyp, LEADMain, LEADUnt, DlgVcl, ltvcldef,
    
```

    diff('diff.*', 'patch.*)
    
    diff -r 950c0adf159e -r e2fb89d57c82 DlgMediaViewer.pas
    --- a/DlgMediaViewer.pas	Fri Jun 14 17:07:29 2013 -0600
    +++ b/DlgMediaViewer.pas	Thu Oct 31 13:17:47 2013 -0600
    @@ -18,8 +18,12 @@
     uses
       Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
       StdCtrls, Menus, OleCtrls, RHMED_VC_4Lib_TLB, ComCtrls, TB97Ctls, ComObj,
    -  TB97Tlbr, TB97, ExtCtrls, RHTrackBar, ShellLnk, RHSpatial_TLB, MediaMapper_TLB,
    -  IPXRHLibLib_TLB, JpegMetaData_TLB, LEADVCL, ltvcldef, DlgVcl, ltvcltyp,
    +  TB97Tlbr, TB97, ExtCtrls, RHTrackBar, ShellLnk,
    +  //TB97Tlbr, TB97, ExtCtrls, RHTrackBar, ShellLnk, MediaMapper_TLB,
    +  //TB97Tlbr, TB97, ExtCtrls, RHTrackBar, ShellLnk, RHSpatial_TLB, MediaMapper_TLB,
    +  IPXRHLibLib_TLB, JpegMetaData_TLB,
    +  // LEADVCL, ltvcldef, DlgVcl, ltvcltyp,
    +  LeadDef, LEADTyp, LEADMain, LEADUnt, DlgVcl, ltvcldef,
       {$IFNDEF RHVIEWER}
       MapXLib_TLB,
       {$ENDIF}

```
####ObjCaptureInstance.pas       
```

    diff('diff.*', 'patch.*)
       
    diff -r 950c0adf159e -r e2fb89d57c82 ObjCaptureInstance.pas
    --- a/ObjCaptureInstance.pas	Fri Jun 14 17:07:29 2013 -0600
    +++ b/ObjCaptureInstance.pas	Thu Oct 31 13:17:47 2013 -0600
    @@ -249,10 +249,12 @@
         OnProgressChanged := nil;
         OnRecompressionStarted := nil;
         OnRecompressionDone := nil;
    +{$IFNDEF RHVIEWER}
         OnVideoClipStarted := nil;
         OnVideoClipEnded := nil;
         OnVideoClipPositioned :=  nil;
         OnVideoClipCancelled := nil;
    +{$ENDIF}
       end;
       SetEvents;
     end;

```
####RhViewer_TLB.pas
note : based tlb.pas on path using PxPt instead of original PixPoint
    
```

    diff('diff.*', 'patch.*)
    
    diff -r 950c0adf159e -r e2fb89d57c82 RhViewer_TLB.pas
    --- a/RhViewer_TLB.pas	Fri Jun 14 17:07:29 2013 -0600
    +++ b/RhViewer_TLB.pas	Thu Oct 31 13:17:47 2013 -0600
    @@ -12,10 +12,10 @@
     // ************************************************************************ //
     
     // PASTLWTR : 1.2
    -// File generated on 3/17/2013 11:51:25 PM from Type Library described below.
    +// File generated on 6/15/2013 1:34:19 PM from Type Library described below.
     
     // ************************************************************************  //
    -// Type Lib: C:\Users\rhsdev\Documents\Projects\PixPoint\Viewer\RhViewer.tlb (1)
    +// Type Lib: C:\Users\rhsdev\Documents\Projects\PxPt\Viewer\RhViewer.tlb (1)
     // LIBID: {1E1E7F63-2ACF-4137-AC91-E417945726F7}
     // LCID: 0
     // Helpfile: 
