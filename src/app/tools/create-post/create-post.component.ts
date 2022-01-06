import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSStorage } from 'firebasets/firebasetsStorage/firebaseTSStorage';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/firebaseTSApp';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent implements OnInit {
  selectedImageFile: File;
  auth = new FirebaseTSAuth();
  firestore = new FirebaseTSFirestore();
  storage = new FirebaseTSStorage();

  constructor(private dialogRef: MatDialogRef<CreatePostComponent>) {}

  ngOnInit(): void {}

  onPostClick(postTextInput: HTMLTextAreaElement) {
    let postText = postTextInput.value;
    if (postText.length < 0) return;
    if (this.selectedImageFile) {
      this.uploadImagePost(postText);
    } else {
      this.uploadPost(postText);
    }
  }

  uploadImagePost(postText: string) {
    let postId = this.firestore.genDocId();
    this.storage.upload({
      uploadName: 'upload Image Post',
      path: ['Posts', postId, 'image'],
      data: {
        data: this.selectedImageFile,
      },
      onComplete: (downloadUrl) => {
        this.firestore.create({
          path: ['Posts', postId],
          data: {
            comment: postText,
            creatorId: this.auth.getAuth().currentUser.uid,
            imageUrl: downloadUrl,
            timestamp: FirebaseTSApp.getFirestoreTimestamp(),
          },
          onComplete: (docId) => {
            this.dialogRef.close();
          },
        });
      },
    });
  }

  uploadPost(postText: string) {
    this.firestore.create({
      path: ['Posts'],
      data: {
        comment: postText,
        creatorId: this.auth.getAuth().currentUser.uid,
        timestamp: FirebaseTSApp.getFirestoreTimestamp(),
      },
      onComplete: (docId) => {
        this.dialogRef.close();
      },
    });
  }

  onPhotoSelected(photoSelector: HTMLInputElement) {
    this.selectedImageFile = photoSelector.files[0];
    if (!this.selectedImageFile) return;
    let fileReader = new FileReader();
    fileReader.readAsDataURL(this.selectedImageFile);
    fileReader.addEventListener('loadend', (ev) => {
      let readableString = fileReader.result.toString();
      let postPreviewImage = <HTMLImageElement>(
        document.getElementById('post-preview-image')
      );
      postPreviewImage.src = readableString;
    });
  }
}
