interface FaceToFaceIconProps {
  className?: string;
}

export const FaceToFaceIcon = ({ className = '' }: FaceToFaceIconProps) => {
  return (
    <img 
      src="/assets/icons/facetoface.png" 
      alt="Face to Face" 
      className={`w-4 h-4 ${className}`}
      width={16}
      height={16}
    />
  );
};

export default FaceToFaceIcon;
