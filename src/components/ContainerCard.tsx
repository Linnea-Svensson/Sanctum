const ContainerCard = ({ children }: { children: any }) => {
  return (
    <div className="bg-black/80 rounded-2xl p-6 w-full shadow-sm border border-white/10">
      {children}
    </div>
  );
};

export default ContainerCard;
