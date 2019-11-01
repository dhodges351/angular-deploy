export class fileHelper {  
  public static getFilesFromImageName(imageName: string)
  {
    var files = new Array<string>();
    var index = 0;
    var newImageName = '';
    if (imageName.indexOf(',') > 0)
    {
      imageName.split(',').forEach(element => {
        index = element.lastIndexOf('/'); 
        newImageName = element.substring(index + 1, element.length);     
        files.push(newImageName);
      });
    }
    else
    {
      index = imageName.lastIndexOf('/'); 
      newImageName = imageName.substring(index + 1, imageName.length); 
      files.push(newImageName);
    }
    return files;
  }  
}