function Series()
{
  this.instances = new Array();
  this.currentInstanceIndex = -1;

  this.addInstance = function(instance)
  {
    this.instances.push(instance);
  }

  this.getNextInstance = function()
  {
    this.currentInstanceIndex++;
    if(this.currentInstanceIndex < this.instances.length)
    {
      this.instances[this.currentInstanceIndex].resetIndex();
      return this.instances[this.currentInstanceIndex];
    }
    else
    {
      return null;
    }
  }

  this.getPrevInstance = function()
  {
    this.currentInstanceIndex--;
    if(this.currentInstanceIndex >= 0)
    {
      this.instances[this.currentInstanceIndex].resetIndex();
      return this.instances[this.currentInstanceIndex];
    }
    else
    {
      return null;
    }
  }

  this.getNumOfInstances = function()
  {
    return this.instances.length;
  }

  this.hasNext = function() 
  {
    var bResult = (this.currentInstanceIndex + 1)  < this.instances.length;
    if((bResult == false) && (this.instances[this.currentInstanceIndex].bMultiFrame))
    {
    	bResult = this.instances[this.currentInstanceIndex].hasNext();
    }
    return bResult;
  }

  this.hasPrev = function()
  {
    var bResult = false;
    bResult = this.currentInstanceIndex > 0;
    if((bResult == false) && (this.instances[this.currentInstanceIndex].bMultiFrame))
    {
    	bResult = this.instances[this.currentInstanceIndex].hasPrev();
    }
    return bResult;
  }

}