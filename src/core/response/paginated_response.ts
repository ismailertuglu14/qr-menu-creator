export default class PaginatedResponse {
  pageSize: number;
  pageNumber: number;
  total: number;
  data: Array<any>;
  constructor(
    pageSize: number,
    pageNumber: number,
    total: number,
    data: Array<any>
  ) {
    this.pageSize = pageSize;
    this.pageNumber = pageNumber;
    this.total = total;
    this.data = data;
  }
}
