import React from 'react';
const ImageMessage: React.FC<{ imageUrl: string }> = ({ imageUrl }) =>
  <div className="zw-chat-imgbox"><img src={imageUrl} className="zw-chat-img" alt="Image" /></div>;
export default ImageMessage;
