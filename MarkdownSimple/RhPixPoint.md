###RHPixPoint
####RHPixPointImpl.pas

The development VM didn't have access to items necessary for license validation.  **In order to facilitate development, the license validation code was altered to always return true.**  This needs to be changed as soon as possible.  It is likely that the original RhPixPoint dll could replace the version created in this project, abandoning all changes.

A project definition was established in the IDE that allowed execution to bypass validation:


+  {$IFNDEF NO_REG_REQUIRED}
       original validation code.

+  {$ELSE}
+  result := True;        <<<<<< always return true during development.
+  {$ENDIF}
```

    diff('diff.*', 'patch.*')

    diff -r b3662b4e9e07 -r 1fe8d7acdeba RHPixPointImpl.pas
    --- a/RHPixPointImpl.pas	Thu Oct 03 14:54:01 2013 -0600
    +++ b/RHPixPointImpl.pas	Tue Oct 15 13:49:27 2013 -0600
    @@ -17,7 +17,7 @@
     
     uses
       ComObj, Sysutils, ActiveX, RHPixPoint_TLB, StdVcl, Windows,
    -  RHFileUtils, RHValidate_TLB;
    +  RHFileUtils, RHValidate_TLB, Dialogs;
     
     type
       TRHPixPointInterface = class(TAutoObject, IRHPixPointInterface)
    @@ -179,10 +179,15 @@
         // bad - so trap them.  Don't take any chances - kill the application
         //MessageDlg('The application could not be initialized.  Please try reinstalling the product.',mtError,[mbok],0);
         result := false;
    +    //ShowMessage('exception in startApp');
       end;
       {$ELSE}
       result := True;
       {$ENDIF}
    +  //if result = True then
    +  //  ShowMessage('leaving startApp : True')
    +  //else
    +  //  ShowMessage('leaving startApp : False');
     end;
     
     function TRHPixPointInterface.Get_HelpFile: WideString;
    @@ -197,6 +202,7 @@
     
     function TRHPixPointInterface.Get_Validated: WordBool;
     begin
    +  {$IFNDEF NO_REG_REQUIRED}
       if not assigned(FRegLib) then
         getRegLib(0);
       try
    @@ -217,6 +223,9 @@
         //MessageDlg('The application could not be initialized.  Please try reinstalling the product.',mtError,[mbok],0);
         result := false;
       end;
    +  {$ELSE}
    +  result := True;
    +  {$ENDIF}
     end;
     
     initialization
```
####RHPixPoint_TLB.pas
 
note : based tlb.pas on path using PxPt instead of original PixPoint

RHPixPoint_TLB.pas has a different guid than was in the original PixPoint version.  Also, the path is altered to a location under PxPt, rather than PixPoint.  This was done to try to avoid mismatches of some of the dependencies during the debugging process.


    +// Type Lib: C:\Users\rhsdev\Documents\Projects\PxPt\RHPixPoint\RHPixPoint2.tlb (1)
    +// LIBID: {9E0475E2-773C-4656-B56A-9042992910A0}

```

    diff('diff.*', 'patch.*')
    diff -r b3662b4e9e07 -r 1fe8d7acdeba RHPixPoint_TLB.pas
    --- a/RHPixPoint_TLB.pas	Thu Oct 03 14:54:01 2013 -0600
    +++ b/RHPixPoint_TLB.pas	Tue Oct 15 13:49:27 2013 -0600
    @@ -12,11 +12,11 @@
     // ************************************************************************ //
     
     // PASTLWTR : 1.2
    -// File generated on 6/13/2013 12:00:37 PM from Type Library described below.
    +// File generated on 10/15/2013 1:48:44 PM from Type Library described below.
     
     // ************************************************************************  //
    -// Type Lib: C:\Users\rhsdev\Documents\Projects\PxPt\RHPixPoint\RHPixPoint.tlb (1)
    -// LIBID: {6C7DD9F7-1A7B-4EBB-A47A-3930F0B9BBC8}
    +// Type Lib: C:\Users\rhsdev\Documents\Projects\PxPt\RHPixPoint\RHPixPoint2.tlb (1)
    +// LIBID: {9E0475E2-773C-4656-B56A-9042992910A0}
     // LCID: 0
     // Helpfile: 
     // HelpString: Red Hen Systems PixPoint Resource Library
    @@ -41,13 +41,13 @@
     // *********************************************************************//
     const
       // TypeLibrary Major and minor versions
    -  RHPixPointMajorVersion = 1;
    +  RHPixPointMajorVersion = 2;
       RHPixPointMinorVersion = 0;
     
    -  LIBID_RHPixPoint: TGUID = '{6C7DD9F7-1A7B-4EBB-A47A-3930F0B9BBC8}';
    +  LIBID_RHPixPoint: TGUID = '{9E0475E2-773C-4656-B56A-9042992910A0}';
     
    -  IID_IRHPixPointInterface: TGUID = '{2DDD61F6-47CC-4894-AADC-3005F3A163A4}';
    -  CLASS_RHPixPointInterface: TGUID = '{72144742-2F36-4AC3-9011-BD2A920A8677}';
    +  IID_IRHPixPointInterface: TGUID = '{A0B50775-8C31-4A98-BB79-C125C0FD0619}';
    +  CLASS_RHPixPointInterface: TGUID = '{5E6DBB44-8A50-45BF-B2BC-318030002287}';
     type
     
     // *********************************************************************//
    @@ -66,10 +66,10 @@
     // *********************************************************************//
     // Interface: IRHPixPointInterface
     // Flags:     (4416) Dual OleAutomation Dispatchable
    -// GUID:      {2DDD61F6-47CC-4894-AADC-3005F3A163A4}
    +// GUID:      {A0B50775-8C31-4A98-BB79-C125C0FD0619}
     // *********************************************************************//
       IRHPixPointInterface = interface(IDispatch)
    -    ['{2DDD61F6-47CC-4894-AADC-3005F3A163A4}']
    +    ['{A0B50775-8C31-4A98-BB79-C125C0FD0619}']
         function Get_name: WideString; safecall;
         procedure Set_name(const Value: WideString); safecall;
         function Get_iconHandle: Integer; safecall;
    @@ -80,25 +80,28 @@
         procedure ShowRegWizard(windowHandle: Integer); safecall;
         function Get_HelpFile: WideString; safecall;
         procedure Set_HelpFile(const Value: WideString); safecall;
    +    function Get_Validated: WordBool; safecall;
         property name: WideString read Get_name write Set_name;
         property iconHandle: Integer read Get_iconHandle write Set_iconHandle;
         property logoHandle: Integer read Get_logoHandle write Set_logoHandle;
         property HelpFile: WideString read Get_HelpFile write Set_HelpFile;
    +    property Validated: WordBool read Get_Validated;
       end;
     
     // *********************************************************************//
     // DispIntf:  IRHPixPointInterfaceDisp
     // Flags:     (4416) Dual OleAutomation Dispatchable
    -// GUID:      {2DDD61F6-47CC-4894-AADC-3005F3A163A4}
    +// GUID:      {A0B50775-8C31-4A98-BB79-C125C0FD0619}
     // *********************************************************************//
       IRHPixPointInterfaceDisp = dispinterface
    -    ['{2DDD61F6-47CC-4894-AADC-3005F3A163A4}']
    +    ['{A0B50775-8C31-4A98-BB79-C125C0FD0619}']
         property name: WideString dispid 2;
         property iconHandle: Integer dispid 3;
         property logoHandle: Integer dispid 4;
         function startApp(windowHandle: Integer): WordBool; dispid 6;
         procedure ShowRegWizard(windowHandle: Integer); dispid 1;
         property HelpFile: WideString dispid 5;
    +    property Validated: WordBool readonly dispid 7;
       end;
     
     // *********************************************************************//
