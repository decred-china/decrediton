import Page from "./Page";
import { CheckWalletStateHeader, CheckWalletStateBody } from "./CheckWalletState";
import { OpenWalletHeader, OpenWalletBody } from "./OpenWallet";
import { StartRPCHeader, StartRPCBody } from "./StartRPC";
import { DiscoverAddressesHeader, DiscoverAddressesBody } from "./DiscoverAddresses";
import { FetchBlockHeadersHeader, FetchBlockHeadersBody } from "./FetchBlockHeaders";
import { FinalStartUpHeader, FinalStartUpBody } from "./FinalStartUp";
import { DaemonLoadingHeader, DaemonLoadingBody } from "./DaemonLoading";
import { AdvancedStartupHeader, AdvancedStartupBody, RemoteAppdataError } from "./AdvancedStartup";
import { SettingsBody, SettingsHeader } from "./Settings";
import { walletStartup } from "connectors";
import { getAppdataPath, getRemoteCredentials } from "config.js";

@autobind
class GetStartedPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { showSettings: false };
    props.determineNeededBlocks();
  }

  componentDidMount() {
    if (!this.props.isAdvancedDaemon) {
      this.props.onStartDaemon();
      return;
    }

    const {rpc_password, rpc_user, rpc_cert, rpc_host, rpc_port} = getRemoteCredentials();
    const hasAllCredentials = rpc_password.length > 0 && rpc_user.length > 0 && rpc_cert.length > 0 && rpc_host.length > 0 && rpc_port.length > 0;
    const hasAppData = getAppdataPath().length > 0;

    if(hasAllCredentials && hasAppData)
      this.props.setCredentialsAppdataError();

    if (!this.props.openForm && hasAppData) {
      this.props.onStartDaemon(null, getAppdataPath());
    } else if (!this.props.openForm && hasAllCredentials) {
      this.props.onStartDaemon(getRemoteCredentials());
    }
  }

  onShowSettings() {
    this.setState({ showSettings: true });
  }

  onHideSettings() {
    this.setState({ showSettings: false });
  }

  render() {
    const {
      startStepIndex,
      isPrepared,
      isAdvancedDaemon,
      openForm,
      remoteAppdataError,
      ...props
    } = this.props;

    const {
      showSettings,
      ...state
    } = this.state;

    const {
      onShowSettings,
      onHideSettings
    } = this;

    let Header, Body;

    if (showSettings) {
      Header = SettingsHeader;
      Body = SettingsBody;
    } else if (isPrepared) {
      switch (startStepIndex || 0) {
      case 0:
      case 1:
        Header = CheckWalletStateHeader;
        Body = CheckWalletStateBody;
        break;
      case 2:
        Header = OpenWalletHeader;
        Body = OpenWalletBody;
        break;
      case 3:
      case 4:
        Header = StartRPCHeader;
        Body = StartRPCBody;
        break;
      case 5:
        Header = DiscoverAddressesHeader;
        Body = DiscoverAddressesBody;
        break;
      case 6:
        Header = FetchBlockHeadersHeader;
        Body = FetchBlockHeadersBody;
        break;
      default:
        Header = FinalStartUpHeader;
        Body = FinalStartUpBody;
      }
    } else {
      if (isAdvancedDaemon && openForm && !remoteAppdataError) {
        Header = AdvancedStartupHeader;
        Body = AdvancedStartupBody;
      } else if (remoteAppdataError) {
        Header = AdvancedStartupHeader;
        Body = RemoteAppdataError;
      } else {
        Header = DaemonLoadingHeader;
        Body = DaemonLoadingBody;
      }
    }

    return <Page Header={Header} Body={Body}
      {...{
        ...props,
        ...state,
        showSettings,
        onShowSettings,
        onHideSettings}} />;
  }
}

export default walletStartup(GetStartedPage);
