import React from 'react';
import PropTypes from 'prop-types';
import {routerRedux} from 'dva/router';
import {connect} from 'dva';
import List from './List';
import {Tabs} from 'antd';
import MultiChoiceEdit from '../../components/DataTable/MultiChoiceEdit';
import Filter from './Filter';

const TabPane = Tabs.TabPane;
const TestItemEnum = {
  QUESTION: 1,
  CHOICE: 2,
};

const TestItems = ({testItems, loading, app, dispatch, location,}) => {
  const {list, pagination, selectedRowKeys, modalVisible, modalType, currentItem} = testItems;
  const {query, pathname} = location;
  const {subjects} = app;
  /**
   * 类型切换
   * @param key
   */
  const handleTabClick = (key) => {
    dispatch(routerRedux.push({
      pathname,
      query: {
        type: key,
      },
    }));
  };

  /**
   * 搜索栏参数
   */
  const filterProps = {
    subjects,
    filter: {
      ...location.query,
    },
    onFilterChange(value) {
      dispatch(routerRedux.push({
        pathname: location.pathname,
        query: {
          ...query,
          ...value,
        },
      }));
    },
    onAdd() {
      dispatch({
        type: 'testItems/showModal',
        payload: {
          modalType: 'create',
        },
      });
    },
  };
  const modalProps = {
    item: modalType === 'create' ? {} : currentItem,
    type: modalType,
    visible: modalVisible,
    maskClosable: false,
    confirmLoading: loading.effects['testItems/update'],
    title: `${modalType === 'create' ? '新建试题' : '修改试题'}`,
    wrapClassName: 'vertical-center-modal',
    onOk(data) {
      dispatch({
        type: `testItems/${modalType}`,
        payload: data,
      });
    },
    onCancel() {
      dispatch({
        type: 'testItems/hideModal',
      });
    },
  };
  /**
   * 列表参数
   * @type {{pagination: *, dataSource: *, loading, location: *, onChange: (function(*)), rowSelection: {selectedRowKeys: *, onChange: (function(*=))}}}
   */
  const listProps = {
    pagination,
    dataSource: list,
    loading: loading.effects['testItems/queryMany'],
    location,
    onChange: (page) => {
      dispatch(routerRedux.push({
        pathname,
        query: {
          ...query,
          page: page.current,
          pageSize: page.pageSize,
        },
      }));
    },
    rowSelection: {
      selectedRowKeys,
      onChange: (keys) => {
        dispatch({
          type: 'testItems/updateState',
          payload: {
            selectedRowKeys: keys,
          },
        });
      },
    },
    onDeleteItem(id) {
      dispatch({
        type: 'testItems/delete',
        payload: id,
      });
    },
    onEditItem(item) {
      dispatch({
        type: 'testItems/showModal',
        payload: {
          modalType: 'update',
          currentItem: item,
        },
      });
    }
  };

  const quesitonPops = {
    type: 1,
    ...listProps
  };
  const selectPops = {
    type: 2,
    ...listProps
  };
  /**
   * 多选框相关方法
   */
  const handleDeleteItems = () => {
    dispatch({
      type: 'testItems/multiDelete',
      payload: {
        ids: selectedRowKeys,
      },
    });
  };
  /**
   * 多选框相关方法
   */
  const handleCancelMultiChoice = () => {
    dispatch({
      type: 'testItems/updateState',
      payload: {
        selectedRowKeys: [],
      },
    });
  };
  return (
    <div className="content-inner">
      <Tabs
        activeKey={query.type === String(TestItemEnum.CHOICE) ? String(TestItemEnum.CHOICE) : String(TestItemEnum.QUESTION)}
        onTabClick={handleTabClick}>
        <TabPane tab="问答题" key={String(TestItemEnum.QUESTION)}>
          {
            selectedRowKeys.length > 0 &&
            <MultiChoiceEdit selectedRowKeys={selectedRowKeys} handleCancelMultiChoice={handleCancelMultiChoice}
                             handleDeleteItems={handleDeleteItems}/>
          }
          <Filter {...filterProps}/>
          <List {...quesitonPops} />
        </TabPane>
        <TabPane tab="选择题" key={String(TestItemEnum.CHOICE)}>
          {
            selectedRowKeys.length > 0 &&
            <MultiChoiceEdit selectedRowKeys={selectedRowKeys} handleCancelMultiChoice={handleCancelMultiChoice}
                             handleDeleteItems={handleDeleteItems}/>
          }
          <Filter {...filterProps}/>
          <List {...selectPops} />
        </TabPane>
      </Tabs>
    </div>
  );
};
TestItems.propTypes = {
  testItems: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
};

export default connect(({testItems, loading, app}) => ({testItems, loading, app}))(TestItems);
