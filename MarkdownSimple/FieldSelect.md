###FieldSelect
####Resources
The icons on the dialogs for FieldSelect and a couple of other destinations relied on finding the bmp in the ArcMap 9.3 folder structure.  In 10.X, the images were mostly changed to png's, and the names, as well as images changed.  Rather than having the installer possibly invalidate the esri license agreement by copying the old bmp's into the corresponding 10.X folder and changing the hard-coded path, the png images were compiled into a resource.  The updated logic loads the images from a resource embedded in the dll, rather than from the file system.

-      iconPath := arcmapPath + 'icons\layers_2.bmp';
-      bitmap.LoadFromFile(iconPath);

Changed to:

+      showMessage('start loading bitmaps');
+      bitmap.LoadFromResourceName(hInstance,'BMCREATELAYER');

The icons to be loaded are identified in LayerIcons.rc, and are compiled into LayerIcons.res.

The project .dpr file adds a line to the list of resources to be compiled:

######{$Resource  'ImagesForDestSelect.res'}
along with the original
######{$R *.RES}
####DlgSelection Form and PSetting
Rebuilding the from with the PSetting chaos required a couple of modifications.  The IDE continually wanted to reposition a couple of controls in the list, along with changing the tab order.  During the experimentation, I had to add the customTreeView to the project.
 
+  customTreeView in 'customTreeView.pas';

The items below provide some detail on the problems with the IDE having conflicts with the current state of PSetting.  When the project is opened, it might warn that variables in the object's code don't match controls in the .dfm.  I got it to work with a couple of work-arounds.

1.  Prior to opening the project, make a copy of the correct dfm file.
2.  Open the project, and ignore the warning.  This will corrupt the dfm file, but leave the .pas file intact.
3.  Make planned changes in the logic in the .pas file and save it.
4.  Copy the backup of the dfm file back over the trashed dfm file.
5.  Build the project.

Two sections of code below show the original and corrupted dfm file.

The DlgSelection form .dfm should be correct in the code.  I have a temporary version in my source control tree, which I didn't commit.  The following discussion describes what I did to get it functioning after the IDE forced the regeneration of either the code or the form after changing the resource strategy for the icons.

The DlgSelectDestination.dfm file itself might still be in the experimental state.  I need to check further to see if I need to provide you with a final version.  In order to distinguish what Delphi was putting into the build, I changed a Caption attribute on the .dmf:

 ---Caption = 'Select destination layer or table'  
 ++Caption = 'Where is the Caption???'
 
 If the form is in an invalid state, you will see the second caption, and you won't get the tree view on the form.
 
 The test version of the form is below, followed by the original version.
 
####Test Version:
 
 >object frmSelectDestination: TfrmSelectDestination
    >>Left = 469
    Top = 167
    BorderIcons = [biSystemMenu]
    BorderStyle = bsSingle
    //Caption = 'Select destination layer or table'  
    Caption = 'Where is the Caption???'
    ClientHeight = 289
    ClientWidth = 296
    Color = clBtnFace
    Font.Charset = DEFAULT_CHARSET
    Font.Color = clWindowText
    Font.Height = -11
    Font.Name = 'MS Sans Serif'
    Font.Style = []
    OldCreateOrder = False
    Position = poOwnerFormCenter
    OnCreate = FormCreate
    OnDestroy = FormDestroy
    OnShow = FormShow
    PixelsPerInch = 96
    TextHeight = 13
    >>
    
  >object lbWarningMessage: TLabel
    >>Left = 8
    Top = 239
    Width = 3
    Height = 13
    Transparent = True
    
  >end
  object btnOK: TButton
    >>Left = 9
    Top = 256
    Width = 57
    Height = 25
    Caption = 'OK'
    Default = True
    TabOrder = 3                         **<<<<<<<< tab order 4 in Original Version below**
    OnClick = btnOKClick
    
  >end
  >object btnCancel: TButton
    >>Left = 74
    Top = 256
    Width = 57
    Height = 25
    Caption = 'Cancel'
    ModalResult = 2
    TabOrder = 5
    
  >end
                                                 **<<<<<<<<<< >customTreeView object missing here**
  object btnCreateLayer: TBitBtn
    >>Left = 8
    Top = 4
    Width = 28
    Height = 26
    Hint = 'Create new layer'
    ParentShowHint = False
    ShowHint = True
    TabOrder = 0
    OnClick = btnCreateLayerClick
    
  >end
  object btnCreateTable: TBitBtn
    >>Left = 36
    Top = 4
    Width = 28
    Height = 26
    Hint = 'Create new table'
    ParentShowHint = False
    ShowHint = True
    TabOrder = 1
    OnClick = btnCreateTableClick
    
  >end
  object btnLoadObject: TBitBtn
    >>Left = 64
    Top = 4
    Width = 28
    Height = 26
    Hint = 'Load layer or table from existing data source'
    ParentShowHint = False
    ShowHint = True
    TabOrder = 2
    OnClick = btnLoadObjectClick
    
  >end
  object btnHelp: TButton
    >>Left = 138
    Top = 256
    Width = 57
    Height = 25
    Caption = 'Help'
    TabOrder = 4
    Visible = False
    OnClick = btnHelpClick
    
  >end
  object loadLayerPopup: TPopupMenu
    >>Left = 128
    object createLayerItem: TMenuItem
      >>>Caption = 'Create new layer'
      OnClick = createLayerItemClick
    >>  
    >>end
    object createTableItem: TMenuItem
      >>>Caption = 'Create new  table'
      OnClick = createTableItemClick
    >>
    >>end
    object LoadLayerItem: TMenuItem
      >>>Caption = 'Load layer or table from existing data source'
      OnClick = LoadLayerItemClick
    >>  
    end
    >>
  >end
  >
end
 
####Original Version:
 
 >object frmSelectDestination: TfrmSelectDestination
  >>Left = 469
  Top = 167
  BorderIcons = [biSystemMenu]
  BorderStyle = bsSingle
  Caption = 'Select destination layer or table'
  ClientHeight = 289
  ClientWidth = 296
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'MS Sans Serif'
  Font.Style = []
  OldCreateOrder = False
  Position = poOwnerFormCenter
  OnCreate = FormCreate
  OnDestroy = FormDestroy
  OnShow = FormShow
  PixelsPerInch = 96
  TextHeight = 13
  
  >object lbWarningMessage: TLabel
    >>Left = 8
    Top = 239
    Width = 3
    Height = 13
    Transparent = True
    
  >end
  >object btnOK: TButton
   >> Left = 9
    Top = 256
    Width = 57
    Height = 25
    Caption = 'OK'
    Default = True
    TabOrder = 4                          **<<<<<<<< tab order 3 in Test Version above**
    OnClick = btnOKClick
    
  >end
  object btnCancel: TButton
    >>Left = 74
    Top = 256
    Width = 57
    Height = 25
    Caption = 'Cancel'
    ModalResult = 2
    TabOrder = 5
    
  >end
  >object tvLayerList: TArcmapTreeView      **<<<<<<<<<< customTreeView missing in version above**
    >>Left = 8
    Top = 34
    Width = 281
    Height = 200
    HideSelection = False
    Indent = 19
    ReadOnly = True
    TabOrder = 3                           **<<<<<<<< tab order 3**
    OnDblClick = tvLayerListDblClick
    OnMouseDown = tvLayerListMouseDown
    
  >end
  >object btnCreateLayer: TBitBtn
    >>Left = 8
    Top = 4
    Width = 28
    Height = 26
    Hint = 'Create new layer'
    ParentShowHint = False
    ShowHint = True
    TabOrder = 0
    OnClick = btnCreateLayerClick
    
  >end
  >object btnCreateTable: TBitBtn
    >>Left = 36
    Top = 4
    Width = 28
    Height = 26
    Hint = 'Create new table'
    ParentShowHint = False
    ShowHint = True
    TabOrder = 1
    OnClick = btnCreateTableClick
    
  >end
  >object btnLoadObject: TBitBtn
    >>Left = 64
    Top = 4
    Width = 28
    Height = 26
    Hint = 'Load layer or table from existing data source'
    ParentShowHint = False
    ShowHint = True
    TabOrder = 2
    OnClick = btnLoadObjectClick
    
  >end
  >object btnHelp: TButton
    >>Left = 138
    Top = 256
    Width = 57
    Height = 25
    Caption = 'Help'
    TabOrder = 6                          **<<<<<<<< tab order 4 in Test Version above**
    Visible = False
    OnClick = btnHelpClick
    
  >end
  >object loadLayerPopup: TPopupMenu
    >>Left = 128
    >>object createLayerItem: TMenuItem
      >>>Caption = 'Create new layer'
      OnClick = createLayerItemClick
     >>
    >>end
    >>object createTableItem: TMenuItem
      >>>Caption = 'Create new  table'
      OnClick = createTableItemClick
    >>
    >>end
    >>object LoadLayerItem: TMenuItem
      >>>Caption = 'Load layer or table from existing data source'
      OnClick = LoadLayerItemClick
    >>
    >>end
    >>
  >end
  >
end
####DlgSelectDestination.pas

The message boxes in the latest code should be removed.  They provided feedback in finding the problem with the obsolete path to bitmaps that are now in resources.

```
    diff('*.diff', '*.patch')
    +
    diff -r aeb533b8719b -r d953336ad799 DlgSelectDestination.pas
    --- a/DlgSelectDestination.pas	Wed Jan 22 17:58:10 2014 -0700
    +++ b/DlgSelectDestination.pas	Fri Jan 24 10:26:52 2014 -0700
    @@ -121,10 +121,12 @@
     procedure TfrmSelectDestination.FormShow(Sender: TObject);
     var
       regObj: TRegistry;
    -  iconPath: string;
       classIdStr: string;
       bitmap: TBitmap;
     begin
    +  //showMessage('TfrmSelectDestination.FormShow');
    +  Application.MessageBox('Ready to load controls.',
    +			   'TfrmSelectDestination.FormShow', 0);
       lbWarningMessage.caption := '';
     
       newObjectAdded := False;
    @@ -143,6 +145,7 @@
       // get the location of arcexe8x\bin directory and set some icons for the
       // TreeView object
       try
    +  showMessage('TfrmSelectDestination.FormShow');
         regObj := TRegistry.Create;
         try
           regObj.access := KEY_READ;
    @@ -157,32 +160,34 @@
     
         if arcmapPath <> '' then
           arcmapPath := ExtractFilePath(arcmapPath);
    +    showMessage(Format('arcmapPath %s', [arcmapPath]));
     
         if not DirectoryExists(arcmapPath) then
           raise Exception.Create('Unable to access the path to Arcmap.exe');
     
    +    showMessage('TBitmap.Create');
         bitmap := TBitmap.Create;
         try
    -      iconPath := arcmapPath + 'icons\layers_2.bmp';
    -      bitmap.LoadFromFile(iconPath);
    +      showMessage('start loading bitmaps');
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
    +      showMessage('finished loading bitmaps');
         finally
           bitmap.free;
         end;
       except
    +    //MessageBox(self, 'Bitmap problems???', 'Bitmap mess', MB_OK);
    +    showMessage('Bitmap problems???');
         // Don't croak just because the bitmaps don't exist...
       end;
     
    @@ -1099,6 +1104,7 @@
     ////////////////////////////////////////////////////////////////////////////////
     procedure TfrmSelectDestination.btnCreateLayerClick(Sender: TObject);
     begin
    +  showMessage('TfrmSelectDestination.btnCreateLayerClick');
       createNewObject('layer');
     end;
```
####ImagesForDestSelect.res
The source for the compiled .res file is in the next section in the .rc file.
 
```
    diff('*.diff', '*.patch')
     
    diff -r aeb533b8719b -r d953336ad799 ImagesForDestSelect.res
    Binary file ImagesForDestSelect.res has changed
    diff -r aeb533b8719b -r d953336ad799 LayerIcons.RES
    Binary file LayerIcons.RES has changed
```
####ImagesForDestSelect.rc
The four images needed were copied from the ArcMap 9.3 icons where they were bmp files.  They were converted to png files for the 10.X standard.  The Delphi source code above refers to them by their resource names in this file.
```
    diff('*.diff', '*.patch')
    diff -r aeb533b8719b -r d953336ad799 LayerIcons.rc
    --- /dev/null	Thu Jan 01 00:00:00 1970 +0000
    +++ b/LayerIcons.rc	Fri Jan 24 10:26:52 2014 -0700
    @@ -0,0 +1,4 @@
    +CREATELAYER   PNG  "layers_2.png"
    +CREATETABLE   PNG  "layers_5.png"
    +LOADOBJECT    PNG  "arcview_table.png"
    +LOADLAYER     PNG  "layer_with_arrow_2.png"

```
####RHFieldSelect.dpr
In addition to adding the resources described above, the customTreeView.pas had to be added to the project to handle PSetting issues.
```

    diff('*.diff', '*.patch')
    diff -r aeb533b8719b -r d953336ad799 RHFieldSelect.dpr
    --- a/RHFieldSelect.dpr	Wed Jan 22 17:58:10 2014 -0700
    +++ b/RHFieldSelect.dpr	Fri Jan 24 10:26:52 2014 -0700
    @@ -1,5 +1,6 @@
     library RHFieldSelect;
     
    +
     uses
       ComServ,
       RHFieldSelect_TLB in 'RHFieldSelect_TLB.pas',
    @@ -11,7 +12,8 @@
       SFolders in 'sfolders.pas',
       ShellOp in 'ShellOp.pas',
       ArcGisUtils in 'ArcGisUtils.pas',
    -  IvDictio in 'IvDictio.pas';
    +  IvDictio in 'IvDictio.pas',
    +  customTreeView in 'customTreeView.pas';
     
     exports
       DllGetClassObject,
    @@ -21,6 +23,7 @@
     
     {$R *.TLB}
     
    +{$Resource  'ImagesForDestSelect.res'}
     {$R *.RES}
     
     begin