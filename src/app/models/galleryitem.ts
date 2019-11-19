export class GalleryItem {   
    constructor(){ 
      this._id = '';    
      this.title = '';
      this.author = '';
      this.image = '';
      this.details = '';
      this.category = '';  
      this.imageList = new Array<string>();
      this.likes = 0;
      this.dislikes = 0;
    }    
    public _id;
    public title;
    public author;
    public image;  
    public details;
    public category;
    public imageList;
    public likes;
    public dislikes;
}