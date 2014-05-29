
###InspectionTool

note : based tlb.pas on path using PxPt instead of original PixPoint, as described in the section below.  This was the only change in the project.
####RHInspectTool_TLB.pas
The typelib interface had to be regenerated for the inspection tool to be used in the PixPoint toolbar.  This forced the dates to change in the _tlb.pas file, and also forced a comment in the file to reflect the pxpt folder in the path, rather than the original pixpoint folder.  Although these changes are both in comments, it could be misleading or difficult to trace if, ultimately, the original pixpoint folder contents are replaced by the pxpt folder contents, and all the projects revert to using paths with pixpoint as a path element.

The projects were duplicated under pxpt because some of the early redevelopment required maintaining paths to pixpoint in the IDE.  Rather than over-writing working 9.3 implementations under pixpoint, the work was accomplished under pxpt.
```

    diff('diff.*', 'patch.*')
    diff -r 304ef104275a -r e8be69148232 RHInspectTool_TLB.pas
    --- a/RHInspectTool_TLB.pas	Fri Jun 14 16:32:18 2013 -0600
    +++ b/RHInspectTool_TLB.pas	Fri Oct 04 19:41:10 2013 -0600
    @@ -12,10 +12,10 @@
     // ************************************************************************ //
     
     // PASTLWTR : 1.2
    -// File generated on 3/17/2013 11:49:44 PM from Type Library described below.
    +// File generated on 10/4/2013 6:46:18 PM from Type Library described below.
     
     // ************************************************************************  //
    -// Type Lib: C:\Users\rhsdev\Documents\Projects\PixPoint\inspectionTool\RHInspectTool.tlb (1)
    +// Type Lib: C:\Users\rhsdev\Documents\Projects\PxPt\inspectionTool\RHInspectTool.tlb (1)
     // LIBID: {3CF3F211-1FDE-4F57-84BE-B1525225318E}
     // LCID: 0
     // Helpfile: 
