import * as React from "react";
import * as _ from "underscore";
import { Repeater } from "../layout/repeater";
import { TableHeading, TSortDirection } from "./tableHeader";
import { TableItem } from "./tableItem";
import { TableItemDropdown } from "./tableItemDropdown";
import { TableTitle } from "./tableTitle";

import "./styles.scss";

export interface ITableProps {
  data: any;
  headers?: string[]; // this overides the data column name
  onChangeItemPerPage?: (items: number) => void;
  hideHeaders?: boolean;
  numberOfPages?: number;
  onChangePage?: (pageNo: number) => void;
  sortBy?: (colName: string, direction: TSortDirection) => void;

  subTitle?: string;
  title?: string;
}

export const Table: React.FunctionComponent<ITableProps> = ({
  data,
  headers,
  onChangeItemPerPage,
  hideHeaders,
  numberOfPages,
  onChangePage,
  sortBy,
  subTitle,
  title,
}) => {
  const [tableHeaders, setTableHeaders] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (headers) {
      setTableHeaders(headers);
    } else {
      setTableHeaders(Object.keys(data[0]).map(header => header));
    }
  }, []);

  return (
    <div className="table-container">
      <TableTitle title={title} subTitle={subTitle} />
      <table className="table">
        {!hideHeaders ? (
          <thead className="table-header">
            <tr>
              {tableHeaders.map(header => (
                <TableHeading key={header} name={header} sortBy={sortBy} />
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody className="table-body">
          {data.map((rows, idx: number) => {
            return <TableItem key={idx} data={rows} />;
          })}
        </tbody>
      </table>

      {onChangePage && numberOfPages && (
        <div className="table-pagination">
          <div style={{ flex: 1 }}></div>
          <div className="pagination">
            <Repeater
              count={numberOfPages}
              render={r => (
                <button onClick={() => onChangePage(r.index)}>{r.index}</button>
              )}
            />
          </div>

          <TableItemDropdown
            values={[5, 10, 20, 0]}
            onSelect={onChangeItemPerPage}
          />
        </div>
      )}
    </div>
  );
};
