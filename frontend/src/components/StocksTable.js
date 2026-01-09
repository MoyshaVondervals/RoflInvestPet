import React, { useMemo, useRef, useState } from 'react';
import { Table, Tag, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';


const StocksTable = ({ data, loading, onRowClick }) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const getStatusTag = (status) => {
        switch (status) {
            case 'Базовый':
                return <Tag color="green">Базовый</Tag>;
            case 'Квалифицированный':
                return <Tag color="blue">Квалифицированный</Tag>;
            case 'Супер квалифицированный':
                return <Tag color="purple">Супер квалифицированный</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex, titleForPlaceholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Поиск по ${titleForPlaceholder || dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Поиск
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters && handleReset(clearFilters);
                            handleSearch(selectedKeys, confirm, dataIndex);
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Сброс
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                        style={{ color: '#1fa038' }}
                    >
                        Закрыть
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1fa038' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#1fa03855', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const { sectorFilters, statusFilters } = useMemo(() => {
        const sectors = new Set();
        const statuses = new Set();
        (data || []).forEach(item => {
            if (item.sector) sectors.add(item.sector);
            if (item.status) statuses.add(item.status);
        });
        return {
            sectorFilters: Array.from(sectors).map(value => ({ text: value, value })),
            statusFilters: Array.from(statuses).map(value => ({ text: value, value })),
        };
    }, [data]);

    const columns = [
        { title: 'Логотип', dataIndex: 'logo', key: 'logo', width: 90 },
        {
            title: 'Тикер',
            dataIndex: 'ticker',
            key: 'ticker',
            ...getColumnSearchProps('ticker', 'тикеру'),
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name', 'названию'),
        },
        {
            title: 'Сектор',
            dataIndex: 'sector',
            key: 'sector',
            filters: sectorFilters,
            onFilter: (value, record) => record.sector === value,
        },
        {
            title: 'Цена',
            dataIndex: 'lastPrice',
            key: 'lastPrice',
            sorter: (a, b) => a.lastPrice - b.lastPrice,
            render: (price) => `${Number(price).toFixed(2)}₽`
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            filters: statusFilters,
            onFilter: (value, record) => record.status === value,
            render: (status) => getStatusTag(status),
        },
    ];

    return (
        <Table
            dataSource={data}
            columns={columns}
            loading={loading}
            showSorterTooltip={{ target: 'sorter-icon' }}
            onRow={(record) => ({
                onClick: () => {
                    if (typeof onRowClick === 'function') {
                        onRowClick(record);
                    }
                },
            })}
        />
    );
};

export default StocksTable;
