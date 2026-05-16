const ContainerCard = ({ children }: { children: any }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 w-full shadow-sm border border-white/10">
      {children}
    </div>
  );
};

export default ContainerCard;
