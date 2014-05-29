###JoinTool

note : based tlb.pas on path using PxPt instead of original PixPoint, as described in the section below.  This was the only change in the project.
####RHJoinTool_TLB.pas
The typelib interface had to be regenerated for the join tool to be used in the PixPoint toolbar.  This forced the dates to change in the _tlb.pas file, and also forced a comment in the file to reflect the pxpt folder in the path, rather than the original pixpoint folder.  Although these changes are both in comments, it could be misleading or difficult to trace if, ultimately, the original pixpoint folder contents are replaced by the pxpt folder contents, and all the projects revert to using paths with pixpoint as a path element.

The projects were duplicated under pxpt because some of the early redevelopment required maintaining paths to pixpoint in the IDE.  Rather than over-writing working 9.3 implementations under pixpoint, the work was accomplished under pxpt.
```

    Diff ('diff.*', 'patch.*')

    diff -r 40f6b1b9fabc -r f94bb89d07e8 RHJoinTool_TLB.pas
    --- a/RHJoinTool_TLB.pas	Fri Jun 14 16:56:33 2013 -0600
    +++ b/RHJoinTool_TLB.pas	Sat Oct 05 14:29:46 2013 -0600
    @@ -12,10 +12,10 @@
     // ************************************************************************ //
     
     // PASTLWTR : 1.2
    -// File generated on 3/18/2013 12:30:46 AM from Type Library described below.
    +// File generated on 6/14/2013 5:08:21 PM from Type Library described below.
     
     // ************************************************************************  //
    -// Type Lib: C:\Users\rhsdev\Documents\Projects\PixPoint\joinTool\RHJoinTool.tlb (1)
    +// Type Lib: C:\Users\rhsdev\Documents\Projects\PxPt\joinTool\RHJoinTool.tlb (1)
     // LIBID: {74DC3033-5219-4F50-B4F5-DDF8E96B2391}
     // LCID: 0
     // Helpfile: 
