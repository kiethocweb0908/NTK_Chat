const NotFoundPage = () => {
  return (
    <div className="bg-accent-foreground flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full flex justify-center">
        <img src="/404.webp" alt="404" className="rounded-2xl h-[85vh] object-cover" />
      </div>
    </div>
  );
};

export default NotFoundPage;
