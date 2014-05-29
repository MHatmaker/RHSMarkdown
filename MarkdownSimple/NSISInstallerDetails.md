###NSIS Installer 

####Clean Environment VM vs Development Environment VM

The Development Environment VM contains all the dll's and tools necessary for Visual Studio and the Borland Delphi IDE and build processes.  On the client VM, all these tools have had their uninstallers executed. Most of the latest work on the NSIS installer used the clean environment VM, to reduce the possibility of missing dll's to be added to the compressed installer that are necessary for the GeoVideo/PixPoint tools.  Building the installer on the development VM, where the application has access to many dll's registered for VS, VC, and Borland runtimes can create the illusion that the installer has incorporated everything necessary for a successful installation on a clean machine.

The installer development occurred under the projects\NSIS Installer folder.  On the client VM, all the Delphi and C++ source folders under projects remain intact.  This allows opening a source file in Notepad++ to try to follow the logging statements in the Log4Delphi files created in tests.  I usually copied a fragment of a line from the log and searched for it under the GeoVideo toolbar or PxPt folders using Windows Grep to find the source file generating the log fragment.

####The Installer \$EXEDIR and $INSTDIR Folders

On the ClientEnvironment VM, you will find a path:

+ C:\Users\rhsdev\Documents\Projects\NSISSamples\GeoVideoInstall

This is where the installer script, **GeoVideoToolbar.nsi** is located.  NSIS refers to the folder containing the installation script as **\$EXEDIR**.  Various commands in the installation script refer to files or folders in the path under $EXEDIR.

Many support folders are arrayed beneath this root.  Virtually every dll we have played with should be somewhere in one or more of them, although the files actually compressed into the installer are primarily in one location.  The main folder you will be concerned with under $EXEDIR is:

+ *GeoVideoFilesForInstallation*

The subfolders GeoVideoFilesForInstallation contain everything that will be extracted to the folder with the same name under appdata\local\GeoVideoInstallTest.  When the installer is compiled, these folders from the source location are all compressed into the installer exe, and they are extracted in the exact same form in the GeoVideoInstallTest location, which NSIS refers to as the **$INSTDIR**. 

The GeoVideoFilesForInstallation intermediate directory could be eliminated in the path by changing one line in the installer:


    setOutPath $INSTDIR
	DetailPrint 'Extract RHS items to "$INSTDIR"'
    File /a /r GeoVideoFilesForInstallation    <<<<<Compress files from this folder

to:

	setOutPath $INSTDIR
    File /a /r GeoVideoFilesForInstallation/*  <<<<< added /* to end of path

The slash/asterisk at the end of the path in the second fragment extracts all the files in the folder (including recursive levels of the subdirectories) under \$INSTDIR, rather than under \$INSTDIR\GeoVideoFilesForInstallation. In development mode, it made it less confusing to have the installer place the uncompressed GeoVideoFilesForInstallation folder under \$INSTDIR exactly as it appears in $EXEDIR.  The discussion of versioning below provides the reasoning.  At some point before finalizing installer work, it might be preferable to eliminate the GeoVideoFilesForInstallation intermediate folder.

At the top of the file, $INSTDIR is defined as:

+ *InstallDir "$LOCALAPPDATA\GeoVideoInstallTest"* 

InstallDir becomes the NSIS built-in variable referred to by $INSTDIR.

The $INSTDIR destination could be changed to:

+ $COMMONFILES\SomeRedHenSubdir\\\*


to place it under C:\\Windows (x86)\\Common Files.  \$COMMONFILES is the NSIS internal variable that selects the proper location, depending on the 32 bit or 32/64 bit target Windows system.  This change will make the installation match the legacy installation trees created by the Wise installer.

####Specifying the target path

The NSIS **setOutPath** command in the fragments above tells the installer where subsequent extractions are to be made.  In this case \$INSTDIR is the default.  At other points in the script, setOutPath is changed to point to other extraction subfolders, such as \$SYSDIR.

####Specifying the source path

The NSIS **File** command in the script fragments refers to the file, directory, or tree structure in the $EXEDIR that will be compressed to create the archive internal to the GeoVideoPixPointToolbarSetup.exe that will be extracted to the path specified by setOutPath.

If you want to experiment with changing the files and where they are copied, you might back up the folder GeoVideoFilesForInstallation from the source location. Then, move some files around, for example, moving LeadTools files from PixPoint to LeadTools14.

####Specifying files for the Windows System folder

The second folder in the source area (\$EXEDIR) to notice is **LeadToolsForInstallation**.  This folder contains a number of both LeadTools 13 and 14.5 files that are copied to the System32 or sysWoW64 folder (\$SYSDIR). These lines in the installer copy them to \$SYSDIR, with a command line option to overwrite only if newer than an existing file there.


    setOutPath $SYSDIR
    DetailPrint 'extract $EXEDIR\LeadToolsForInstallation to "$SYSDIR"'
    SetOverwrite ifnewer
    File /a /r LeadToolsForInstallation\*   <<<<<Compress files from this folder
    SetOverwrite off
    setOutPath $INSTDIR

In the installer log file, \$EXEDIR and \$SYSDIR in the DetailPrint command will be expanded to the full path string.

####Lists of files for registration

The main source file for the installer is **GeoVideoToolbar.nsi** in the C:\Users\rhsdev\Documents\Projects\NSISSamples\GeoVideoInstall folder.  It includes several other installer scripts I wrote:

  1. !include "RHSMacros.nsh"
  2. !include "Mpeg2DmxInstaller.nsh"
  3. !include DetermineArcGISVersion.nsh
  4. !include FilesToBeRegistered.nsh
  5. !include FilesToBeSysDirRegistered.nsh
  6. !include ListCategoriesRegister.nsh

You should only need to be concerned with the last three.  For example, **FilesToBeRegistered.nsh** has the names of all the Red Hen Systems dll''s that need to be registered.  **FilesToBeSysDirRegistered.nsh** contains only files that need to be registered in \$SYSDIR.  And **ListCategoriesRegister.nsh** contains the names of the four component tools needing to be categories registered by EsriRegAsm.exe.

During development and testing, emails frequently refer to the Kitchen Sink, some folders typically loaded with many system, VC, Borland, LeadTools, etc. that have been redundantly copied into the PixPoint and/or Libraries folders.  On the more sane versions, I have the LeadTools14 things only in the LeadTools folders.  They can be removed from the other folders where they are mingled with non-Leadools dll's with the commands

	"delete LT*14*"
	"delete LF*14*".

The common recommendations specify creating an installation target folder for LeadTools14.  When the LT14 COM controls are registered in the dedicated folder, LeadTools controls find the other non-COM dlls there as well.  The same approach might not work for the LT13 redistributable.  Some of the other RHS tools expect them to be in \$SYSDIR.

####Dependency experimentation

You shouldn't need to change any logic in GeoVideoToolbar.nsi to experiment. You only need to do two things:

+ Move some files around under  GeoVideoFilesForInstallation.
+ If any of the files added or moved need to be registered, make sure they are present and have the correct subpath in FilesToBeRegistered.nsh or FilesToBeSysDirRegistered.nsh.

For example, to clear the LT14 files out of PixPoint, change several lines in FilesToBeRegistered.nsh, such as:

${List.Add} FilesToBeRegistered "Red Hen Systems\PixPoint\LTCML14n.dll"

to

${List.Add} FilesToBeRegistered "LeadTools14\LTCML14n.dll"

Currently, there is only one file in the FilesToBeSysDirRegistered.nsh list:

\${List.Add} FilesToBeSysDirRegistered "$SYSDIR\msxml4.dll"

The distinction between the two lists in FilesToBeRegistered.nsh and FilesToBeSysDirRegistered.nsh is that a different NSIS command with permissions is necessary for registering a dll in \$SYSDIR.  The assumption behind having only one file in the FilesToBeSysDirRegistered list is that a new Windows 7 computer will already have a number of dll''s that have been missing from previous platforms.  The $EXEDIR folder on the clean VM clone has subfolders with names, such as MSVC_ETC, FilesForSysDir, and various Borland library folders.  During development, files from these folders where frequently placed in one of the primary installation tree folders described above.

####Compiling the Installer

After you have modified the GeoVideoFilesForInstallation tree contents, or the lists in the .nsh files, right click on GeoVideoToolbar.nsi in File Explorer and hit the compile option.  It opens the compiler tool, and builds everything, stopping on any errors.  If the compiler tool is already open, you can click its re-compile button.   When it finishes, the test installer button is enabled.  When you click it, everything you put in your \$EXEDIR GeoVideoFilesForInstallation folders that was compressed into the exe is extracted to $INSTDIR.  The log appears in the NSIS tool window.  Right click in the window and it gives you the option to copy the installation log to the clipboard.  The clipboard contents can be copied into a text editor for examination.  Searching for "error" or "fail" locates some errors

####Editing installer scripts

The Notepad++ application in the Windows menu knows how to highlight syntax and tab correctly in .nsi and .nsh files.  I altered the color for comments so that they are more readable than the Notepad++ NSIS plugin default.

####Version control on the installer script

If you clone the ClientEnvironment VM, it will already have Mercurial (hg) and tortoise hg installed.  (The periodic table abbreviates mercury as hg.)  If you make changes in any logic (probably mainly in the lists in the .nsh files), you should right click on the GeoVideoInstall folder, and tell it to open up the Hg Workbench.  It is pretty much like SVN, and you could commit your changes if you get something working better.  Branching is also much more sane than in SVN, in case you want to get adventurous.

The mercurial repository is replicated on BitBucket.org.  During development, revisions were frequently pushed to the mirror, using the toolbar buttons.  The mirror repository is the primary advantage of mercurial over subversion.  Mercurial is a distributed version control system, and the client does not have to be connected over a vpn to a single central repository, as in subversion.

####Version control for the installation tree

The GeoVideoFilesForInstallation tree is not versioned.  Before making drastic changes in the folders in an installation that mostly works, copy the tree to somewhere for backup.  So, there might be tree copies with the kitchen sink organization, tree backups with the minimum in PixPoint and Libraries.  The minimum version has worked on many occasions on at least one VM configuration.  Ultimately, elimination of kitchen sink redundancy in the Libraries, PixPoint, LeadTools, and $SYSDIR folders is desirable.

The current structure of the GeoVideoFilesForInstallation in the \$EXEDIR that is exactly duplicated in the \$INSTDIR facilitates keeping track of named backups.  For example, if experimentation with file combinations in the \$SYSDIR GeoVideoFilesForInstallation fails, one of the backups of what was working in \$INSTDIR the GeoVideoFilesForInstallation tree (or subfolders or files) can be copied back to \$EXEDIR\GeoVideoFilesForInstallation.

####Quick modifications for testing installation combinations
On occasion, testing a couple of dll''s in \$INSTDIR might be desirable. You might not want to manipulate the files in \$EXEDIR\GeoVideoFilesForInstallation and rebuild the installer.  The quick alternative is to move a couple of files around in \$INSTDIR\GeoVideoFilesForInstallation .  If they need to be registered, you should probably un-register them before you move them, and register them after they have been moved. That has worked fairly well in narrowing down problems, such as RhImageBrowser on Demo-PC without having to rebuild the installer, upload it and download it.

####Uninstall old installation before installing new version
As always, if you rebuild the installer, before you test it, go to the windows menu and uninstall the current version.