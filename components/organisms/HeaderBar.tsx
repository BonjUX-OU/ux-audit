import AccountMenu from "../molecules/AccountMenu";
import Logo from "../molecules/Logo";

const HeaderBar = () => {
  return (
    <header className="border-border h-[5rem] w-full border-b bg-white drop-shadow-sm">
      <div className="mx-auto flex items-center justify-between px-8 py-5">
        {/* Logo */}
        <Logo />
        {/* Nav Right */}
        <AccountMenu />
      </div>
    </header>
  );
};

export default HeaderBar;
