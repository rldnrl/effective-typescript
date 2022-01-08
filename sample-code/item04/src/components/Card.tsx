type CardProps = {
  title: string;
  content: string;
  thumbnail: string;
  onClick: () => void;
};

const Card = ({ title, content, thumbnail, onClick }: CardProps) => {
  return (
    <div>
      <img src={thumbnail} alt={title} width="80" height="80" />
      <section>{title}</section>
      <section>{content}</section>
      <button onClick={onClick}>글 확인하기</button>
    </div>
  );
};

export default Card;
