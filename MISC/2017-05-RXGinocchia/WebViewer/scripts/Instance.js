function Instance()
{
  this.bMultiFrame = false;
  this.bIsReport = false;
  this.bIsEndDoc = false;
  this.URLs = new Array();
  this.currentIndex = -1;
  this.instanceNumber = "0";
  this.SOPInstUID = "";
  this.aContent = new Array();
  this.init = function(){}

  this.getNextImage = function()
  {
    this.currentIndex++;
    
	if (!this.bIsReport)
	{
		
		if(this.URLs.length > this.currentIndex)
		{
		  return this.URLs[this.currentIndex];
		}
		else
		{
		  return null;
		}
	}
	else
	{
		if (this.aContent.length > this.currentIndex)
		{
			return this.aContent[this.currentIndex];
		}
		else
		{
			return null;
		}
	
	}
	
  }

  this.getPrevImage = function()
  {
    this.currentIndex--;
    if(this.URLs.length > 0 && this.currentIndex >= 0)
    {
      return this.URLs[this.currentIndex];
    }
    else
    {
      return null;
    }
  }

  this.resetIndex = function()
  {
    this.currentIndex = -1;
  }
  
  this.hasNext = function()
  {
  	return (this.URLs.length > (this.currentIndex + 1));
  }
  
  this.hasPrev = function()
  {
  	return this.currentIndex > 0;
  }
  
  this.addContent = function(sHtmlVal)
  {
	this.aContent.push(sHtmlVal);
  }
}