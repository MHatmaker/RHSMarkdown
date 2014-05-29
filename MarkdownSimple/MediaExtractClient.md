###MediaExtractClient

This tool is designed to exercise the VmsNmeaSimpleLib.VmsNmeaDumper, RhGpsXml, and RhMediaExtractor without having to run the extractor process inside ArcMap.  This client simplified isolating threading problems in the extraction from threading in the ArcMap GUI.

This Delphi project is under the CPP folder within Projects to keep it out of the other GeoVideoToolbar projects, and also because it is a test client for the VmsNmeaSimpleLib.VmsNmeaDumper, which is a C++ project in the CPP directory.

####MediaExtractClient.pas

This module provides a simple dialog to select a media file (mpg only in this version), and run it through the extractor/dumper steps to create a gps log file with a .nmea extension.  At conclusion of the extraction, it presents the user with the option to quit, or proceed to convert the gps log file records to xml records in an output file with the .xml extension.

Alternatively, if a gps log file already exists, the Gps to Xml conversion button provides the user with a file browser dialog to select an existing gps log file and convert it to the xml output file.

The template string for the file browser dialog needs to be changed to allow the browser to display media files other than mpg.

'''

	diff('Delphi.*', 'pas.*')

	  // Allow only .mpg files to be selected
	  openDialog.Filter :=
	    'Media Files|*.mpg';    <<<<<<< add more media types here
    
####ObjSpatialIndexing.pas

This module is almost a duplicate of the same module in the GeoVideoToolbar project.  The differences are to use the path to the media file obtained from MediaExtractClient.pas, rather than the file browser dialog in the import process in GeoVideoToolbar.
    
