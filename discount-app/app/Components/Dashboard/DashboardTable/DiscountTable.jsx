import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { getIdFromUrl } from "../../../utils/UrlUtils";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
} from "@nextui-org/react";
import * as PlusIcon from "./PlusIcon";
import { SearchIcon } from "./SearchIcon";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { columns, statusOptions } from "./data";
import { capitalize } from "./utils";
import {
  activeAllDiscount,
  deactiveAllDiscount,
  deleteDiscounts,
  getAllDiscount,
} from "../../../api/DiscountAPI";
import { VerticalDotsIcon } from "./VerticalDotsIcon";
const statusColorMap = {
  ACTIVE: "success",
  EXPIRED: "danger",
  SCHEDULED: "secondary",
};

const INITIAL_VISIBLE_COLUMNS = [
  "title",
  "status",
  "method",
  "type",
  "combinations",
  "used",
  "actions",
];

export default function App({ onOpen }) {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [discounts, setDiscounts] = React.useState([]);

  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const handleGetAllDiscounts = async () => {
    const data = await getAllDiscount();
    setDiscounts(data);
  };
  useEffect(() => {
    handleGetAllDiscounts();
  }, []);
  const hasSearchFilter = Boolean(filterValue);
  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredDiscounts = [...discounts];

    if (hasSearchFilter) {
      filteredDiscounts = filteredDiscounts.filter((discount) =>
        discount.basicDetail.title
          .toLowerCase()
          .includes(filterValue.toLowerCase()),
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredDiscounts = filteredDiscounts.filter((discount) =>
        Array.from(statusFilter).includes(
          discount.basicDetail.status.toLowerCase(),
        ),
      );
    }
    return filteredDiscounts;
  }, [discounts, filterValue, statusFilter]);
  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);
  const navigate = useNavigate();
  const moveToEditPage = (discount) => {
    const split = getIdFromUrl(discount.basicDetail.id);
    navigate(`/app/discounts/${split.type}/${split.id}`, {
      replace: true,
      relative: "path",
      state: { some: "state" },
    });
  };
  const renderCell = React.useCallback(
    (discount, columnKey) => {
      const cellValue = discount.basicDetail[columnKey];
      switch (columnKey) {
        case "title":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{cellValue}</p>
              <p className="text-bold text-tiny capitalize text-default-400">
                {discount.basicDetail.summary}
              </p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[discount.basicDetail.status]}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          );
        case "method":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{cellValue}</p>
            </div>
          );
        case "type":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{cellValue}</p>
            </div>
          );
        case "combinations":
          return (
            <div className="flex flex-col">
              {discount.basicDetail.combinesWith.productDiscounts &&
                discount.basicDetail.combinesWith.orderDiscounts &&
                discount.basicDetail.combinesWith.shippingDiscounts && (
                  <p className="text-bold text-small capitalize">all</p>
                )}
              {discount.basicDetail.combinesWith.productDiscounts &&
                !discount.basicDetail.combinesWith.orderDiscounts &&
                !discount.basicDetail.combinesWith.shippingDiscounts && (
                  <p className="text-bold text-small capitalize">
                    Product Discounts
                  </p>
                )}
              {!discount.basicDetail.combinesWith.productDiscounts &&
                discount.basicDetail.combinesWith.orderDiscounts &&
                !discount.basicDetail.combinesWith.shippingDiscounts && (
                  <p className="text-bold text-small capitalize">
                    Order Discounts
                  </p>
                )}
              {!discount.basicDetail.combinesWith.productDiscounts &&
                !discount.basicDetail.combinesWith.orderDiscounts &&
                discount.basicDetail.combinesWith.shippingDiscounts && (
                  <p className="text-bold text-small capitalize">
                    Shipping Discounts
                  </p>
                )}
              {discount.basicDetail.combinesWith.productDiscounts &&
                discount.basicDetail.combinesWith.orderDiscounts &&
                !discount.basicDetail.combinesWith.shippingDiscounts && (
                  <p className="text-bold text-small capitalize">
                    Product Discounts, Order Discounts
                  </p>
                )}
              {!discount.basicDetail.combinesWith.productDiscounts &&
                discount.basicDetail.combinesWith.orderDiscounts &&
                discount.basicDetail.combinesWith.shippingDiscounts && (
                  <p className="text-bold text-small capitalize">
                    Shipping Discounts, Order Discounts
                  </p>
                )}
              {discount.basicDetail.combinesWith.productDiscounts &&
                !discount.basicDetail.combinesWith.orderDiscounts &&
                discount.basicDetail.combinesWith.shippingDiscounts && (
                  <p className="text-bold text-small capitalize">
                    Product Discounts, Shipping Discounts
                  </p>
                )}
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotsIcon className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem onClick={() => activeAllDiscounts(discount)}>
                    Active Discount
                  </DropdownItem>
                  <DropdownItem onClick={() => deactiveAllDiscounts(discount)}>
                    Deactive Discount
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      moveToEditPage(discount);
                    }}
                  >
                    View
                  </DropdownItem>
                  <DropdownItem onClick={() => deleteDiscount(discount)}>
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [discounts],
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by code or title..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => {
                  return (
                    <DropdownItem key={status.uid} className="capitalize">
                      {capitalize(status.name)}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              endContent={<PlusIcon.PlusIcon />}
              onPress={onOpen}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {discounts.length} discounts
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    discounts.length,
    onSearchChange,
    hasSearchFilter,
  ]);
  const deleteDiscount = async (discounts) => {
    const data = await deleteDiscounts(discounts);

    if (!data) {
      setDiscounts([]);
    } else {
      setDiscounts(data);
    }
  };
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);
  const deactiveAllDiscounts = async (discounts) => {
    const data = await deactiveAllDiscount(discounts);

    setDiscounts(data);
  };
  const activeAllDiscounts = async (discounts) => {
    const data = await activeAllDiscount(discounts);

    setDiscounts(data);
  };
  const renderColumn = React.useMemo(() => {
    if (selectedKeys === "all") {
      return (
        <TableColumn key={"actions"} align="center">
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem onClick={() => activeAllDiscounts(discounts)}>
                  Active Discounts
                </DropdownItem>
                <DropdownItem onClick={() => deactiveAllDiscounts(discounts)}>
                  Deactive Discounts
                </DropdownItem>
                <DropdownItem onClick={() => deleteDiscount(discounts)}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </TableColumn>
      );
    } else {
      return (
        <TableColumn key={"actions"} align="center">
          Actions
        </TableColumn>
      );
    }
  }, [selectedKeys]);
  const renderTableBody = React.useMemo(() => {
    return (
      <TableBody emptyContent={"No discounts found"} items={sortedItems}>
        {(discount) => (
          <TableRow key={discount._id}>
            {(columnKey) => {
              return <TableCell>{renderCell(discount, columnKey)}</TableCell>;
            }}
          </TableRow>
        )}
      </TableBody>
    );
  }, [discounts, sortedItems]);
  return (
    <Table
      aria-label="Example table with custom cells, pagination and sorting"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        <TableColumn key={"title"} allowsSorting={true} align="start">
          Title
        </TableColumn>
        <TableColumn key={"status"} align="start">
          Status
        </TableColumn>
        <TableColumn key={"method"} align="start">
          Method
        </TableColumn>
        <TableColumn key={"type"} align="start">
          Type
        </TableColumn>
        <TableColumn key={"combinations"} align="start">
          Combinations
        </TableColumn>
        {renderColumn}
      </TableHeader>
      {renderTableBody}
    </Table>
  );
}
