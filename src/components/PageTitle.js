import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

const PageTitle = ({ title }) => {
    return (
        <Helmet>
            <title>{title} | 알테구 관리자</title>
        </Helmet>
    );
};

PageTitle.propTypes = {
    title: PropTypes.string.isRequired,
};
export default PageTitle;
