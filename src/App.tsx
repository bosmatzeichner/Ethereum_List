import "./App.css";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
const PageSize = 20;
const MaxTransactions = 10000;

interface Transaction {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  isError: string;
  nonce: string;
  timeStamp: string;
  to: string;
  transactionIndex: string;
  txreceipt_status: string;
  value: string;
}
function App() {
  const [listData, setListData] = useState([] as Transaction[]);
  const [ethereumAddress, setEthereumAddress] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [observer, setObserver] = useState(null as any);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const loader: MutableRefObject<any> = useRef(null);

  useEffect(() => {
    var options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };
    const observer = new IntersectionObserver(handleObserver, options);
    setObserver(observer);
    if (loader.current) {
      observer.observe(loader.current);
    }
  }, []);
  useEffect(() => {
    if (hasNextPage) {
      if (loader.current) {
        observer.observe(loader.current);
      }
    }
  }, [hasNextPage]);

  useEffect(() => {
    if (isLoadingData) {
      return;
    }
    if (page === 0) {
      return;
    }
    setIsLoadingData(true);
    fetchData(ethereumAddress, page).then((response) => {
      setIsLoadingData(false);
      if (response === undefined || response?.error) {
        setHasNextPage(false);
        setPage(0);
        setError(response?.error || "Unknown Error");
        return;
      }
      setListData([...listData, ...response.data.result]);
      if (page * PageSize >= MaxTransactions) {
        setHasNextPage(false);
      }
    });
  }, [page]);

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0];
    if (target.isIntersecting) {
      setPage((page) => page + 1);
    }
  };

  const applyEthereumAddress = () => {
    if (ethereumAddress) {
      setPage(0);
      setListData([]);
      setError("");
      setHasNextPage(true);
    } else {
      setError("A url is required");
    }
  };

  return (
    <div className="App">
      <div className={"InputSection"}>
        <input
          className="Input"
          value={ethereumAddress}
          placeholder={
            "Please enter a valid url with/without account address, for example: https://api.etherscan.io/api "
          }
          onChange={(e) => setEthereumAddress(e.target.value)}
        />
        <button className="Btn" onClick={applyEthereumAddress}>
          Apply Ethereum Address
        </button>
        {error}
      </div>
      <div className="List">
        {listData.map(getListItem())}
        {hasNextPage && <div className="Loader" ref={loader}></div>}
      </div>
    </div>
  );
}

export default App;

function getListItem(): (
  value: Transaction,
  index: number,
  array: Transaction[]
) => JSX.Element {
  return ({ timeStamp, from, to, value, confirmations, hash }, idx) => (
    <div key={idx} className="List-item">
      <p> Timestamp: {formatTime(timeStamp)}</p>
      <p> From: {from}</p>
      <p> To: {to}</p>
      <p> Value Of Transaction: {value}</p>
      <p> Confirmations: {confirmations}</p>
      <p> Hash: {hash}</p>
    </div>
  );
}
interface ApiParams {
  module?: string;
  action?: string;
  address?: string;
  page?: number;
  offset?: number;
  sort?: string;
  apikey?: string;
}
function fetchData(ethereumAddress: string, page: number): Promise<any> {
  //https://api.etherscan.io/api
  const params: ApiParams = {
    module: "account",
    action: "txlist",
    address: "0x38cd7db12edc7724a6a403c1a63d3c12682fd687",
    page,
    offset: PageSize,
    sort: "desc",
    apikey: "T1JX12UU9U5QIFKFY3QZK7GDVXIJCMBQKH",
  };

  if (ethereumAddress.includes("address")) {
    delete params.address;
  }

  return axios
    .get(ethereumAddress, {
      params,
    })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
      return { error: error?.message };
    });
}
function formatTime(timestamp: string) {
  return moment(parseInt(timestamp)).format("MM/DD/YYYY HH:mm:ss");
}
