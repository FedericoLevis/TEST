Viewer = new function()
  {
    this.loadedSeries = null;
    this.currentInstance = null;
    this.otherFiles = new Array();

    this.$nextButton = null;
    this.$prevButton = null;
    this.$imagePanel = null;
    this.$otherFilesButton = null;

    this.sImageHeight = "auto";
    this.sImageWidth = "auto";

    this.$frame = null;
    this.$frameOverlay = null;

    this.init = function($nextButton, $prevButton, $otherFilesButton, $imagePanel)
    {
      this.$nextButton = $nextButton;
      this.$prevButton = $prevButton;
      $prevButton[0].disabled = true;
      $nextButton[0].disabled = true;
      this.$otherFilesButton = $otherFilesButton;
      if($.browser.msie && $.browser.version < 7)
      {   
        Viewer.$nextButton.css("background-image", "url('./WebViewer/res/nextDisabled.png')");
        Viewer.$prevButton.css("background-image", "url('./WebViewer/res/prevDisabled.png')");
      }
      this.$imagePanel = $imagePanel;
    }

    this.showAttachedFilesDialog = function()
    {
      this.$frameOverlay = $("<div/>").addClass("ui-widget-overlay");
      var $frameHeader = $("<div/>").addClass("frameHeader");
      var $exitButton = $("<span/>").addClass("frameExitButton").click(function(){
        Viewer.$frame.hide();
        Viewer.$frameOverlay.hide();
        Viewer.$frame.remove();
        Viewer.$frameOverlay.remove();
      });

      $frameHeader.append($exitButton).append("<div class=\"frameTitle\">Attached Files</div>");
      var $list = $("<ol/>");
      for(var i=0; i< this.otherFiles.length; i++)
      {
        $list.append($("<li/>").append("<a href='" + this.otherFiles[i].URLs[0] + "' >" + this.otherFiles[i].URLs[0] + "</a>"));
      }
      var $content = $("<div/>").attr("id", "frameContent").addClass("frameContent").append($list);
      
      Viewer.$frame = $("<div/>").addClass("frame").append($frameHeader).append($content).hide();
      Viewer.$frameOverlay.appendTo("body");
      Viewer.$frame.appendTo("body");
      var hCenter = ($(window).width() - 500)/2;
      hCenter = hCenter < 0 ? 0 : hCenter;
      var vCenter = $(document).scrollTop() + (($(window).height() - Viewer.$frame.innerHeight())/2);
      vCenter = vCenter < 0 ? 0 : vCenter;
      var frameWidth = 500 < $(window).width() ? 500 : $(window).width();
      Viewer.$frame.css("width", frameWidth);
      Viewer.$frame.css("left", hCenter);
      Viewer.$frame.css("top", vCenter);

      Viewer.$frameOverlay.css({
        "width" : $(document).width(),
        "height" : $(document).height()
        });
      Viewer.$frameOverlay.show();
      Viewer.$frame.show();

    }

    updateIE6Button = function()
    {
      if($.browser.msie && $.browser.version < 7)
      {
        if(!Viewer.$nextButton[0].disabled)
        {
          Viewer.$nextButton.css("background-image", "url('./WebViewer/res/next.png')");
        }
        else
        {
          Viewer.$nextButton.css("background-image", "url('./WebViewer/res/nextDisabled.png')");
        }
        if(!Viewer.$prevButton[0].disabled)
        {
          Viewer.$prevButton.css("background-image", "url('./WebViewer/res/prev.png')");
        }
        else
        {
          Viewer.$prevButton.css("background-image", "url('./WebViewer/res/prevDisabled.png')");
        }
      }
    }

    this.loadSeries = function(seriesId)
    {
      this.$imagePanel.attr("src", "./WebViewer/res/blackPixel.jpg");
   		$(".selected").removeClass("selected");
   		$("#" + seriesId).children().addClass("selected");
      this.loadedSeries = new Series();
      this.otherFiles = [];
      
	  $("#" + seriesId + " .single").each(function(){
        var tmp = new Instance();
        tmp.SOPInstUID = $(this).attr("rel");
        tmp.instanceNumber = $(this).attr("title") == "" ? "0" : $(this).attr("title");
        
        if($("#" + seriesId).attr("class") == "report")
        {
          tmp.bIsReport = true;
		  tmp.addContent($(this).html());
        }
		else
		{
			tmp.URLs.push($(this).text());
		}
        Viewer.loadedSeries.addInstance(tmp);
      });
	  
	  
      $("#" + seriesId + " .multi").each(function(){
        var tmp = new Instance();
        tmp.SOPInstUID = $(this).attr("rel");
        tmp.instanceNumber = $(this).attr("title") == "" ? "0" : $(this).attr("title");
        var aFiles = $(this).text().split(";");
        for(var i = 0; i < aFiles.length - 1; i++)
        {
          tmp.URLs.push(aFiles[i]);
        }
        tmp.bMultiFrame = true;
        Viewer.loadedSeries.addInstance(tmp);
      });

      $("#" + seriesId + " .doc").each(function(){
        var tmp = new Instance();
        tmp.bIsEndDoc = true;
        tmp.SOPInstUID = $(this).attr("rel");
        tmp.instanceNumber = $(this).attr("title") == "" ? "0" : $(this).attr("title");
        tmp.URLs.push($(this).text());
        Viewer.otherFiles.push(tmp);
      });

      if(this.otherFiles.length > 0)
      {
        this.$otherFilesButton.fadeIn(500);
        this.showAttachedFilesDialog();
      }
      else
      {
        this.$otherFilesButton.fadeOut(500);
      }

      // Calculate and set the image panel y position
      var seriesOffset = $("#" + seriesId).parent().parent().parent().parent().parent().parent().offset().top - 156;
      seriesOffset = seriesOffset > 0 ? seriesOffset : 0;
      var viewerContainerOffset = $(".ViewerContainer").offset().top;
	  
      if(Viewer.loadedSeries.getNumOfInstances() > 0)
      {
        Viewer.currentInstance = Viewer.loadedSeries.getNextInstance();
		
        if(Viewer.currentInstance.bIsReport == false)
        {
          var instanceNumberText = "Instance Number: " + this.currentInstance.instanceNumber;
          instanceNumberText += " (1/" + this.loadedSeries.getNumOfInstances() + ")";
          $("#instanceNumberLabel").text(instanceNumberText);
          var frameNumberText = "Frame Number: 1" + "/" + this.currentInstance.URLs.length;
          $("#frameNumberLabel").text(frameNumberText);
          var img = new Image();
          this.sImageHeight = "auto";
          this.sImageWidth = "auto";
          var URL = Viewer.currentInstance.getNextImage();
          $(img)
          .load(function(){
			
            if(this.height >= this.width)
            {
              Viewer.sImageHeight = "512px";
            }
            else
            {
              Viewer.sImageWidth = "512px";
            }
            Viewer.$imagePanel.css({
              "height" : Viewer.sImageHeight,
              "width" : Viewer.sImageWidth
            });
            if(viewerContainerOffset != (seriesOffset + 4))
            {
              var tableHeight = $(".MainTable").height();
              if((seriesOffset + $(".ViewerContainer").height() + 10) < tableHeight)
              {
                seriesOffset = seriesOffset + "px";
              }
              else
              {
                seriesOffset = ((tableHeight - $(".ViewerContainer").height()) - 10) + "px";
              }
              $(".ViewerContainer").animate({
                "top" : seriesOffset
              }, "slow", "swing",function(){
                Viewer.$imagePanel.attr("src", URL);
                Viewer.$nextButton[0].disabled = !Viewer.loadedSeries.hasNext();
                Viewer.$prevButton[0].disabled = !Viewer.loadedSeries.hasPrev();
                updateIE6Button();
              });
            }
            else
            {
              Viewer.$imagePanel.attr("src", URL);
              Viewer.$nextButton[0].disabled = !Viewer.loadedSeries.hasNext();
              Viewer.$prevButton[0].disabled = !Viewer.loadedSeries.hasPrev();
              updateIE6Button();
            }
          })
          .error(function(){
            alert("An error occured while downloading the image")
          })
          .attr('src',URL);
        }
        else
        {
          this.$nextButton[0].disabled = true;
          this.$prevButton[0].disabled = true;
          updateIE6Button();
		  
          Viewer.showReport();
        }
      }
    };

    this.showNextImage = function()
    {
      if(this.loadedSeries != null)
      {
        var URL;
		
		if((this.currentInstance != null) && (URL = this.currentInstance.getNextImage()) != null)
		{
		  this.$imagePanel.attr("src", URL);
		  this.$nextButton[0].disabled = !this.loadedSeries.hasNext();
		  this.$prevButton[0].disabled = !this.loadedSeries.hasPrev();
		  updateIE6Button();
		}
		else
		{
		  this.currentInstance = this.loadedSeries.getNextInstance();
		  if(this.currentInstance != null)
		  {
			this.currentInstance.resetIndex();
			this.$imagePanel.attr("src", this.currentInstance.getNextImage());
			this.$nextButton[0].disabled = !this.loadedSeries.hasNext();
			this.$prevButton[0].disabled = !this.loadedSeries.hasPrev();
			updateIE6Button();
		  }
		  else
		  {
			this.$nextButton[0].disabled = true;
		  }
		}
		if (this.currentInstance != null)
		{
			// Update Frame number
			var instanceNumberText = "Instance Number: " + this.currentInstance.instanceNumber;
			instanceNumberText += " (" + (this.loadedSeries.currentInstanceIndex+1) + "/" + this.loadedSeries.getNumOfInstances() + ")";
			$("#instanceNumberLabel").text(instanceNumberText);
			var frameNumberText = "Frame Number: " + (this.currentInstance.currentIndex + 1) + "/" + this.currentInstance.URLs.length;
			$("#frameNumberLabel").text(frameNumberText);
		}
		
      }
    }

    this.showPrevImage = function()
    {
      if(this.loadedSeries != null)
      {
        var URL;
        
		if((this.currentInstance != null) && (URL = this.currentInstance.getPrevImage()) != null)
        {
          this.$imagePanel.attr("src", URL);
          this.$nextButton[0].disabled = !this.loadedSeries.hasNext();
          this.$prevButton[0].disabled = !this.loadedSeries.hasPrev();
          updateIE6Button();
        }
        else
        {
          this.currentInstance = this.loadedSeries.getPrevInstance();
          
          if(this.currentInstance != null)
          {
			this.currentInstance.resetIndex();
			this.$imagePanel.attr("src", this.currentInstance.getNextImage());
            this.$nextButton[0].disabled = !this.loadedSeries.hasNext();
            this.$prevButton[0].disabled = !this.loadedSeries.hasPrev();
            updateIE6Button();
          }
          else
          {
            this.$prevButton[0].disabled = true;
          }
        }
        // Update Frame number
		if (this.currentInstance != null)
		{
			var instanceNumberText = "Instance Number: " + this.currentInstance.instanceNumber;
			instanceNumberText += " (" + (this.loadedSeries.currentInstanceIndex+1) + "/" + this.loadedSeries.getNumOfInstances() + ")";
			$("#instanceNumberLabel").text(instanceNumberText);
			var frameNumberText = "Frame Number: " + (this.currentInstance.currentIndex + 1) + "/" + this.currentInstance.URLs.length;
			$("#frameNumberLabel").text(frameNumberText);
		}
      }
    }

    this.showNextReport = function()
    {
      if (this.$frame != null && this.loadedSeries.hasNext())
      {
        this.currentInstance = this.loadedSeries.getNextInstance();
        if(this.currentInstance != null)
        {
          $("#frameContent").html(this.currentInstance.getNextImage());
          if(!this.loadedSeries.hasNext())
          {
            $(".frameNextButton").addClass("frameNextButtonDisabled");
          }
          if(this.loadedSeries.hasPrev())
          {
            $(".framePrevButton").removeClass("framePrevButtonDisabled");
          }
        }
      }
    };

    this.showPrevReport = function()
    {
      if (this.$frame != null && this.loadedSeries.hasPrev())
      {
        this.currentInstance = this.loadedSeries.getPrevInstance();
        if(this.currentInstance != null)
        {
          var URL = this.currentInstance.getNextImage();
          $("#frameContent").html(URL);
          if(!this.loadedSeries.hasPrev())
          {
            $(".framePrevButton").addClass("framePrevButtonDisabled");
          }
          if(this.loadedSeries.hasNext())
          {
            $(".frameNextButton").removeClass("frameNextButtonDisabled");
          }
        }
      }
    };

    this.showReport = function()
    {
      // overlay
      
	  this.$frameOverlay = $("<div/>").addClass("ui-widget-overlay");
      var $frameHeader = $("<div/>").addClass("frameHeader");
      var $exitButton = $("<span/>").addClass("frameExitButton").click(function(){
        Viewer.$frame.hide();
        Viewer.$frameOverlay.hide();
        Viewer.$frame.remove();
        Viewer.$frameOverlay.remove();
      });

      $frameHeader.append($exitButton);
      var $reportNextButton = $("<div/>").addClass("frameNextButton").click(function(){
        Viewer.showNextReport();
      });
      var $reportPrevButton = $("<div/>").addClass("framePrevButton").click(function(){
        Viewer.showPrevReport();
      });
      if(!Viewer.loadedSeries.hasNext())$reportNextButton.addClass("frameNextButtonDisabled");
      if(!Viewer.loadedSeries.hasPrev())$reportPrevButton.addClass("framePrevButtonDisabled");
      var $frameButtonPanel = $("<div/>").addClass("frameButtonPanel").append($reportPrevButton).append($reportNextButton);
      
	  var reportContent = this.currentInstance.getNextImage();
	  
      var $content = $("<div/>").attr("id", "frameContent").addClass("frameContent").html(reportContent);
      Viewer.$frame = $("<div/>").addClass("frame").append($frameHeader).append($content).hide();
		Viewer.$frame.append($frameButtonPanel);

		Viewer.$frameOverlay.appendTo("body");
		Viewer.$frame.appendTo("body");
		var hCenter = ($(window).width() - 900)/2;
		hCenter = hCenter < 0 ? 0 : hCenter;
		var vCenter = $(document).scrollTop() + (($(window).height() - Viewer.$frame.innerHeight())/2);
		vCenter = vCenter < 0 ? 0 : vCenter;
		var frameWidth = 900 < $(window).width() ? 900 : $(window).width();
		Viewer.$frame.css("width", frameWidth);
		Viewer.$frame.css("left", hCenter);
		Viewer.$frame.css("top", vCenter);

		Viewer.$frameOverlay.css({
		"width" : $(document).width(),
		"height" : $(document).height()
		});
		Viewer.$frameOverlay.show();
		Viewer.$frame.show();
	 
    }
	
    this.showReferencedImage = function(sSOPInstUID, iFrameNumber)
    {
      var $instanceSpan;
      $instanceSpan = $(".image span[rel='" + sSOPInstUID + "']");

      if($instanceSpan.length > 0)
      {
        var sImageURL = $instanceSpan.text();
        if(iFrameNumber)
        {
          // Get the correct image for the frame
          var sListOfUrls = $instanceSpan.text();
          sImageURL = sListOfUrls.split(";")[iFrameNumber-1];
        }
        window.open(sImageURL);
      }
    }
    
    this.isJREInstalled = function()
    {
    	var bJavaWSInstalled = false;
        
        var bIsIE = false;
        var bIsFF = false;
        var bIsChrome = false;
        var bIsOpera = false;
        var bUnknownBrowser = false;
        
        //alert('User Agent: ' + navigator.userAgent);

        // Get the OS
        if (navigator.userAgent.indexOf("Windows") != -1)
        {
            this.bIsWindows = true;
        }

        // Check if it is a known web browser
        if (navigator.userAgent.indexOf("MSIE") != -1)
        {
            bIsIE = true;
        }
        else if (navigator.userAgent.indexOf("Firefox") != -1)
        {
            bIsFF = true;
        }
        else if (navigator.userAgent.indexOf("Chrome") != -1)
        {
            bIsChrome = true;
        }
        else if (navigator.userAgent.indexOf("Opera") != -1)
        {
            bIsOpera = true;

        }

        else
        {
            bUnknownBrowser = true;
        }

        // Determine if JWS is installed or not
        if (navigator.mimeTypes && navigator.mimeTypes.length)
        {
            x = navigator.mimeTypes['application/x-java-jnlp-file'];

            if (x)
            {
                bJavaWSInstalled = true;
                
            }
        }
        // If we are on a known browser, having Java 5 or Java 6 installed
        // also normally means we have Java Web Start installed, and vice-versa.
        
        if ((bIsIE && ( !this.isJavaWS5IE()) && ( !this.isJavaWS6IE())) ||
                (bIsFF && (! this.isJava5()) && (! this.isJava6())) ||
                (bIsChrome && (! this.isJava5()) && (! this.isJava6())) ||
                (bIsOpera && (! this.isJava5()) && (! this.isJava6()) && !bJavaWSInstalled)
                )
        {
            return false;
        }
        else if (bUnknownBrowser && (! bJavaWSInstalled))
        {
            return false;
        }

        return true;
    };
    
    this.isJavaWS5IE = function()
    {
        try
        {
            // Detect Java 5 platform
            var obj = new ActiveXObject("JavaWebStart.isInstalled.1.5.0.0");
            if (obj != null)
            {
                return true;
            }
            return false;
        }
        catch (exception)
        {
            return false;
        }

        return false;
    };


    this.isJavaWS6IE = function()
    {
        try
        {
            // Detect Java 6 platform
            var obj = new ActiveXObject("JavaWebStart.isInstalled.1.6.0.0");
            if (obj != null)
            {
                return true;
            }
            return false;
        }
        catch (exception)
        {
            return false;
        }

        return false;
    }

    this.isJava5 = function()
    {
        if (navigator.mimeTypes && navigator.mimeTypes.length)
        {
            for (var i = 0; i < navigator.mimeTypes.length; ++i)
            {
                s = navigator.mimeTypes[i].type;
                //alert(s);
                // Detect Java 5 platform
                if (s == "application/x-java-applet;version=1.5")
                {
                    return 1;
                }
            }
        }

        return 0;
    };

    this.isJava6 = function()
    {
        if (navigator.mimeTypes && navigator.mimeTypes.length)
        {
            for (var i = 0; i < navigator.mimeTypes.length; ++i)
            {
                s = navigator.mimeTypes[i].type;
                //alert(s);

                // Detect Java 6 platform
                if (s == "application/x-java-applet;version=1.6")
                {
                    return 1;
                }
            }
        }

        return 0;
    };
    
    this.launchLocalEye = function()
    {
    	try
    	{
	    	// overlay
	      this.$frameOverlay = $("<div/>").addClass("ui-widget-overlay");
	      var $frameHeader = $("<div/>").addClass("frameHeader");
	      var $exitButton = $("<span/>").addClass("frameExitButton").click(function(){
	        Viewer.$frame.hide();
	        Viewer.$frameOverlay.hide();
	        Viewer.$frame.remove();
	        Viewer.$frameOverlay.remove();
	      });
	
	      $frameHeader.append($exitButton);
	      
	      var $content = $("<div/>").attr("id", "frameContent").addClass("frameContent")
	      .append("<div style='width:100%;height:100%;text-align:center;vertical-align:middle'><span>Loading LocalEye... Please Wait.</span><br /><img src='WebViewer/res/LocalEyeLoader.gif' alt='Loading' style='text-align:center;clear:both;margin:15px;' /><br/></div>");
        
	      Viewer.$frame = $("<div/>").addClass("frame").append($frameHeader).append($content).hide();
        
        Viewer.$frameOverlay.appendTo("body");
        Viewer.$frame.appendTo("body");
        var hCenter = ($(window).width() - 400)/2;
        hCenter = hCenter < 0 ? 0 : hCenter;
        var vCenter = $(document).scrollTop() + (($(window).height() - Viewer.$frame.innerHeight())/2);
        vCenter = vCenter < 0 ? 0 : vCenter;
        var frameWidth = 400 < $(window).width() ? 400 : $(window).width();
        Viewer.$frame.css("width", frameWidth);
        Viewer.$frame.css("left", hCenter);
        Viewer.$frame.css("top", vCenter);
	      
        Viewer.$frameOverlay.css({
          "width" : $(document).width(),
          "height" : $(document).height()
          });
        Viewer.$frameOverlay.show();
        Viewer.$frame.show();
	    	
	    	// Autoclose timeout
        setTimeout('Viewer.$frame.hide();\
	        Viewer.$frameOverlay.hide();\
	        Viewer.$frame.remove();\
	        Viewer.$frameOverlay.remove();', 10000);

	    	var sPlatform = navigator.platform;
	    	
	    	if (sPlatform.indexOf("Win") > -1) 
	    	{
	    		if ($.browser.msie)
	    		{
	    			try
	    			{
		    			var path = window.location.href;
		    			var pos = path.indexOf("file:");
		    			if (pos != -1)
		    			{
			    			pos = pos + 5 ;
			    			while(path[pos] == "/")
			    			{
			    				pos++;
			    			}
		    			}
		    			else
		    			{
		    				// if it not start with file:// then the device letter 
		    				// is the first one char.
		    				pos = 0;
		    			}
		    			var command = path[pos] + ":\\Viewer-Windows\\LocalEyeLauncher.exe";
		    			var ws = new ActiveXObject("WScript.Shell");
		  				ws.Exec(command);
		  				}
		  				catch(ex)
	  				{
	  					this.launchLocalEyeViaApplet();
	  				}
	    		}
	    		else
	    		{
	    			this.launchLocalEyeViaApplet();
	    		}
	    	}
	    	else if (sPlatform.indexOf("Linux") > -1)
	    	{
	    		 this.launchLocalEyeViaApplet();
	    	}
	    	else if (sPlatform.indexOf("Mac") > -1)
	    	{
	    		 this.launchLocalEyeViaApplet();
	    	}
	    	else
	    	{
	    		 this.launchLocalEyeViaApplet();
	    	}
    	}
    	catch (ex)
    	{
    		alert(ex);
    	}
    }
    
    this.launchLocalEyeViaApplet = function()
    {
    	if (this.isJREInstalled())
  		{
  			if (document.getElementById("launcher") == null)
  			{
    			try
    			{
	    			var $myApplet = $("<applet>").attr({
	    				"id"	:	"launcher",
	    				"ARCHIVE" : "WebViewer/LocalEyeLauncher.jar",
	    				"CODE" : "localeyelauncher.LocalEyeLauncher",
	    				"WIDTH" : "0px",
	    				"HEIGHT" : "0px"
	    			})
	    			.appendTo("body");
    			}
    			catch (ex)
    			{
    				window.location.href = "./MANUAL.PDF";
    			}
  			}
  			else
  			{
  				document.getElementById("launcher").launchLocalEye();
  			}
			}
			else
			{
				window.location.href = "./MANUAL.PDF";
			}
    };
	};

// Register onLoad funtion
$(function(){
  var $nextButton = $("#nextButton");
  var $prevButton = $("#prevButton");
  var $imagePanel = $("#imagePanel");
  var $otherFilesButton = $("#otherFilesButton");

  $otherFilesButton.click(function(){
    Viewer.showAttachedFilesDialog();
  });
  $(".StudyTableInfoRow").click(function(){
  	Viewer.loadSeries($(this).next().find("tbody tr:first").attr("id"));
  });
  $(".SeriesTable tbody tr").click(function(){ 
    Viewer.loadSeries(this.id);
  });
  Viewer.init($nextButton, $prevButton, $otherFilesButton, $imagePanel);
  //Load First Image
  Viewer.loadSeries($(".image").get(0).id);
  
  // Register image onclick handler 
  $("#imagePanel").click(function(){
    window.open(this.src);
  });
});