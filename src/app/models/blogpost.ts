export class Blogpost {
    constructor(){    
        this.category = '';
        this.title = '';
        this.short_desc = '';
        this.author = '';
        this.image = '';
      }      
      public   category: string;
      public   title: string;
      public   short_desc: string;
      public   author: string;
      public   image: string;
      public   createdAt: Date;
      public   updatedAt: Date; 
}

