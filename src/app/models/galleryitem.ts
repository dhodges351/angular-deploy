export class GalleryItem {   
    constructor(){     
      this.title = '';
      this.author = '';
      this.image = '';
      this.details = '';
      this.category = '';  
      this.imageList = new Array<string>();
    }    
    public title;
    public author;
    public image;  
    public details;
    public category;
    public imageList;
}