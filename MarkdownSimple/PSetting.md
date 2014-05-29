###PSetting

A few issues remain in the PSetting upgrade to Delphi 7. It proved difficult to make the Delphi 4 version to work with Delphi 7 in PixPoint and RhImageBrowser.  It complained that the way it imported PSetting in the Uses statement was deprecated, and I couldn't get it to allow me to view the forms or build the numerous forms projects.

####PSetting purpose
PSetting is designed to manage all form data in form projects in which it is included.  It has options to store form settings in various places, including config files or in the registry.  So, when the user has navigated to a folder in a media import dialog, the next time the user runs ArcMap, the import dialog will open with the same folder displayed.  Every time the dialog is closed, PSetting persists the form control contents to the store..  The user never sees the PSEdit forms that are displayed in the attached files.  They are only used by the developer at design/build time.

The PSetting PSEdit form attribute modification screen captures are referred to in several comments below:

#####PSetting General Tab

---

![PSetting General Tab][1]
[1]: http://gdriv.es/rhsmarkdown/PSettingFormScreenCaptureTabGeneral.png

---

#####PSetting Advanced Tab
![PSetting Advanced Tab][2]
[2]: http://gdriv.es/rhsmarkdown/PSettingFormScreenCapture.png


---


####Interim solution
The solution to the deprecation issue and the build failure was to make PSEdit.pas inherit from DsgnIntf.  This had the immediate benefit of getting everything to build and execute.  However, the IDE still would not open the forms, which would allow the developer to initialize or edit various control values in the forms at design time or in an IDE edit session.  Since we weren't creating or editing forms, and the persistence part was working, other GeoVideo and PixPoint upgrades took precedence.
####Evolution of the interim solution
The reason PSEdit.pas is not completely working has to do with the interaction between PSEdit.pas and PSEdit.dfm (the editor form shown in the included screen captures).  We had a PSetting folder for D2, D3, and D4, but the PSEdit.dfm was binary in every version.  Every Red Hen System form/dialog and code-behind Delphi file to be upgraded required the ability to open the PSEdit.dfm.

In attempting to download a Dephi 7 version, every search turned up shareware sites that wanted $24 to pass through to CoolDev.com.  Testing all the links indicates that CoolDev.com hasn't been around since about 2004.  CoolDev took over PSetting from Pythoness Software, which seems to have disappeared in about 1998, probably around the end of Delphi 4.

Also, the links all indicated binary only downloads, with no source code.  A couple of sites in China had a download button for the source.  They displayed the source tree where the underlying folder for CoolPSetting was exactly the contents of our PSetting folders.  It appears that all the CoolDev work on PSetting was a wrapper.  Clicking on any of the download buttons to try to capture the source zip was blocked in every instance by the browser informing that the sites were known malware distributors.

Realizing the CoolPSetting was just building on PSetting, tne next step appeared to require taking the binary PSEdit.dfm had been created by someone in building the Delphi package that gets put in the Delphi BPL folder, and converting it from binary back to text.  With that conversion, the PSetting project now has a text PSEdit.dfm.  With that file, it should be possible to go back in and hook up the form editing tools disabled when rebuilding PSetting to work with DsgnIntf.  

In fact, using this text-based form, the PSEdit.dfm form shown in the screen captures can be opened while working in the Delphi IDE with a RHS form project.  The screen captures show a couple of tabs on the PSEdit form.

The last section below mentions an Embarcadero posting that described
a step by step process to separate the design parts of a module from
the run-time parts.  The legacy PSetting and PSEdit code followed the exact format of the Embarcadero posting example used in the step by step description.

The interim workaround, possible because no attributes were changing in any PixPoint or RhImageBrowser forms, required a couple of steps.  The IDE repeatedly trashed the form contents or the code-behind file, or both, any time an attempt was made to open the code-behind.

A successful build of a dialog/form project requiring changing a code behind file involves three steps:

1.  Make a backup of the SomeForm.dfm file.
2.  Edit the SomeForm.pas file.
     a. Delphi pops a warning that the .pas code and .dfm contents are inconsistent.
     b.  Ignore the warning and edit the SomeForm.pas.
     c. SomeForm.dfm gets updated, with all the inconsistent elements elimated.
3.  Copy the backup of SomeForm.dfm back over the truncated current copy trashed by the IDE.
####An approach to a permanent solution
This is obviously not an optimal solution.  The preceding discussion documents discoveries so far, and the workaround.  An experienced Delphi developer could get the PSEdit part of the PSetting package reintegrated quickly.  The interim solution moved the disabled code into a second .pas module, and put stubs in the primary PSEdit.pas module.  The disabled code needs to be moved back into the primary source code.

The solution required building PSetting into a Delphi Package (.dpk) and moving it into the Borland/Delphi package library as a .bpl.  Without a solid background in the workings of the Delphi IDE, creating the .dpk appears to be the result of accidentally hitting the wizard buttons in the right order.  A better understanding of the hidden magic is necessary to reduce fears of trashing something in the Imports or BPL folders that is currently working.

####Workarounds documented withing project documents
FieldSelect.md and other documents provide details on the "refactoring" the IDE did in the field selection dialog.

###Additional notes on upgrading PSetting
The following discussion clips ancient history in 8/1/13 email from my first encounter with PSetting:

I think I have gotten past the design-time form editor problem.
PixPoint is using a system called PSetting, which was originally
developed by a company in Rexburg, Idaho.  I don't think it has been
maintained since about 1999.  If you go to the website at
http://www.pythoness.com, they seem to be functioning as a providerr
of links to other services, ranging from travel and financial services
to cosmetic surgery.  If you click on the link for delphi components,
it takes you to sites selling delphi automotive components.  The links
for delphi programmers take you to commercial delphi software
providers.  If you search for PSetting on these various sites or in
google, you get hits that describe PSetting, with a link back to free
downloads at Pythoness.com.  I have yet to find a download for it.
Every hit in google indiicates that we have the latet PSetting system.
 I don't know what the license issues might involve, but I can provide
you with the file header information, and the email link in that
heading is support@pythoness.com

PSetting is hooked to many of the PixPoint dialogs.  It provides for
building a stream of the PixPoint dialog-managed properties to persist
them to a configuration file or to the registry.  It uses some Delphi
tools, such as DsgnIntf.pas and its dependencies that were deprecated
in Delphi 5.  They violated third party component vendor licensing
agreements, since they packaged the design tools into libraries that
were distributed with run-time systems.  After a couple of iterations,
the Delphi 7 driver now is called DesignIntf.pas, and it works with
internal Delphi components called DesignEditors.

I looked into two options for getting past the dependencies PSetting
couldn't find in Delphi 7.  I saw a suggestion that to migrate ancient
code to Delphi 7 using DsgnIntf instead of DesignIntr, you could grab
all the old DsgnIntf pieces and access them from your project, rather
than through the built-in paths in the IDE.  Billy had created a
folder that had the four primary DsgnIntf items from Delphi 4, so I
started with them.  Every time it complained that it couldn't find a
dependency, I did a google search and found source code.  I downloaded
the source code, and got to the next step where that code couldn't
find something in the Delphi 7 environment.  After a few recursions, I
didn't find one of the dependencies.

Next, I looked into upgrading the PixPoint project to use the Delphi 7
DesignIntf and DesignEditors components.  Although there are a number
of dialogs in PixPoint, all but one used the Delphi 4 DsgnIntf through
PSetting in the layout process.

So, I tried upgrading PSetting from Delphi 4 to 7.  After hitting a
few dead Borland links, I found an Embarcadero posting that described
a step by step process to separate the design parts of a module from
the run-time parts. Looking into PSetting and PSEdit, I was amazed to
find that the code followed the exact format of the example used in
the step by step description.

I created a PSetting project, and worked through the steps.  I was
able to create a PSetting design package and a PSetting run-time
package.  I am including those in PixPoint, and have gotten past the
constant complaints about missing components.  So, I think this is
going to work.  I just wonder what to do about the Pythoness
situation.  This still seems to be a better situation for any future
maintenance than trying to limp along with the Delphi 4 dsgnintf stuff
in Delphi 7 or later.

