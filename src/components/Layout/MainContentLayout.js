function MainContentLayout({ children, show }) {
    return (
        <div
            style={{ opacity: show ? 1 : 0, display: show ? "unset" : "none" }}
        >
            {children}
        </div>
    );
}

export default MainContentLayout;
