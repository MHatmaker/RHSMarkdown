##Working with the Delphi IDE and the Red Hen Systems Projects file structure

###Directory Structure

####Primary Projects (GeoVideotoolbar and PixPoint)
The Delphi and C++ projects are under C:\users\rhsdev\documents\projects.  On the original VM created for the development environment, the projects were primarily under GeoVideo11 and PixPoint.  In order to (1) avoid over-writing in these original locations, and (2) leave the contents in place for the possibility of running a debugging session with the original projects, two new folders were created under Projects:

+ GeoVideo11 cloned to GV11ForArc10X 
+ PixPoint cloned to PxPt

These folders initially were duplicates of GeoVideo11 and PixPoint.  The subdirectories under these root folders include dcu, where the Delphi compiled units from all the projects under the root, and bin, where the dll's and required binaries are written.

####Supplemental Folders

######CPP
A third directory, CPP, contains both Delphi and C++ projects that were built from existing RHS C++ projects and C++ and Delphi projects that were created to provide test clients for the previously existing C++ projects. This facilitated interactive debugging in both the C++ and Delphi source code.  For some reason, the Delphi IDE will not allow inspection of variables in a debug session when the Delphi debugger is connected to a dll loaded by ArcMap.  Sometimes, it allows setting breakpoints.  In the stand-alone test client environment under the C++ folder, both C++ and Delphi code can be inspected interactively in Visual Studio or the Delphi IDE.

######Components
A folder named Components resides under the Projects folder.  It contains a number of other folders that might not all have anything to do with GeoVideoToolbar/PixPoint.  I added to the PSetting folder, which had PSetting versions for Delphi 2, 3, and 4.  The added folder is named Upgrading.  In addition, folders for Log4Delphi source and binaries were added under Components.

######Common Files
Projects\GeoVideo Common Files appears to be a copy of the installed Red Hen Systems GeoVideo/PixPoint binaries that the Wise installer placed under C:\Program Files\Common Files.  This file structure should probably be maintained here when the NSIS installer is changed to extract under C:\Program Files\Common Files.  The system analysis tools, such as CheckReg.py return the locations of all the dll's by guid.  Many of them are legacy dll's from the C:\Program Files\Common Files location.  The CheckReg.py results allow comparison of registry contents and dll locations on various Windows 7 test systems.  The dll dates and sizes will reflect all the modified projects after the NSIS installer target is changed.  If a test with a pristine dll is desired, it would need to be copied from C:\Users\rhsdev\Documents\Projects\GeoVideo Common Files to C:\Program Files\Common Files.

######DLL's (bin)
While building all the dll's that needed upgrading for ArcGIS 10.X, the build process placed newly generated dll's under the PixPoint or GeoVideo bin folders.  On the clean client VM's, these updated binaries were copied to the installation source folder to be extracted to the installer target folder.  The installer registers them in the target folder.  However, on the development VM, copying a newly created dll from the project bin folder to the installer source or target folder would have required extra steps, and would have been confusing.  In Visual Studio, this can be automated in a post-build step.  In the Delphi IDE, I didn't attempt to duplicate this behavior.  I preferred to register the modified dll from the project bin folder.

###Utility Programs

CheckReg.py, facilitates keeping track of the differences in binaries between tests or across Windows 7 systems.  If I have registered dll's in a different location, I run CheckReg.py and rename the resulting CurrentRegistration.txt to CurrentRegistration_xx_yy.txt, with the date in the new name.  This allows comparison of registrations between configurations that are working or failing on various test systems.




