import React, { useState, useEffect } from 'react'
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import TopicView from './TopicView';
import Modal from './Modal';

const TopicFeed = (props) => {
  const [page, setPage] = useState({ content: [] });
  const [isLoadingTopics, setLoadingTopics] = useState(false);
  const [isLoadingOldTopics, setLoadingOldTopics] = useState(false);
  const [isLoadingNewTopics, setLoadingNewTopics] = useState(false);
  const [isDeletingTopic, setDeletingTopic] = useState(false);
  const [newTopicCount, setNewTopicCount] = useState(0);
  const [topicToBeDeleted, setTopicToBeDeleted] = useState();

  useEffect(() => {
    const loadTopics = () => {
      setLoadingTopics(true);
      apiCalls.loadTopics(props.user).then((response) => {
        setLoadingTopics(false);
        setPage(response.data);
      });
    };
    loadTopics();
  }, [props.user]);

  useEffect(() => {
    const checkCount = () => {
      const topics = page.content;
      let topTopicId = 0;
      if (topics.length > 0) {
        topTopicId = topics[0].id;
      }
      apiCalls.loadNewTopicCount(topTopicId, props.user).then((response) => {
        setNewTopicCount(response.data.count);
      });
    };
    const counter = setInterval(checkCount, 3000);
    return function cleanup() {
      clearInterval(counter);
    };
  }, [props.user, page.content]);


  const onClickLoadMore = () => {
    if (isLoadingOldTopics) {
      return;
    }
    const topics = page.content;
    if (topics.length === 0) {
      return;
    }
    const topicAtBottom = topics[topics.length - 1];
    setLoadingOldTopics(true);
    apiCalls
      .loadOldTopics(topicAtBottom.id, props.user)
      .then((response) => {
        setPage((previousPage) => ({
          ...previousPage,
          last: response.data.last,
          content: [...previousPage.content, ...response.data.content],
        }));
        setLoadingOldTopics(false);
      })
      .catch((error) => {
        setLoadingOldTopics(false);
      });
  };

  const onClickLoadNew = () => {
    if (isLoadingNewTopics) {
      return;
    }
    const topics = page.content;
    let topTopicId = 0;
    if (topics.length > 0) {
      topTopicId = topics[0].id;
    }
    setLoadingNewTopics(true);
    apiCalls
      .loadNewTopics(topTopicId, props.user)
      .then((response) => {
        setPage((previousPage) => ({
          ...previousPage,
          content: [...response.data, ...previousPage.content],
        }));
        setLoadingNewTopics(false);
        setNewTopicCount(0);
      })
      .catch((error) => {
        setLoadingNewTopics(false);
      });
  };

  const onClickModalOk = () => {
    setDeletingTopic(true);
    apiCalls.deleteTopic(topicToBeDeleted.id).then((response) => {
      setPage((previousPage) => ({
        ...previousPage,
        content: previousPage.content.filter(
          (topic) => topic.id !== topicToBeDeleted.id
        ),
      }));
      setDeletingTopic(false);
      setTopicToBeDeleted();
    });
  };

  if (isLoadingTopics) {
    return <Spinner />;
  }
  if (page.content.length === 0 && newTopicCount === 0) {
    return (
      <div className="card card-header text-center">There are no topics</div>
    );
  }
  const newTopicCountMessage =
    newTopicCount === 1
      ? 'There is 1 new topic'
      : `There are ${newTopicCount} new topics`;
  return (
    <div>
      {newTopicCount > 0 && (
        <div
          className="card card-header text-center"
          onClick={onClickLoadNew}
          style={{
            cursor: isLoadingNewTopics ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoadingNewTopics ? <Spinner /> : newTopicCountMessage}
        </div>
      )}
      {page.content.map((topic) => {
        return (
          <TopicView
            key={topic.id}
            topic={topic}
            onClickDelete={() => setTopicToBeDeleted(topic)}
          />
        );
      })}
      {page.last === false && (
        <div
          className="card card-header text-center"
          onClick={onClickLoadMore}
          style={{
            cursor: isLoadingOldTopics ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoadingOldTopics ? <Spinner /> : 'Load More'}
        </div>
      )}
      <Modal
        visible={topicToBeDeleted && true}
        onClickCancel={() => setTopicToBeDeleted()}
        body={
          topicToBeDeleted &&
          `Are you sure to delete '${topicToBeDeleted.content}'?`
        }
        title="Delete!"
        okButton="Delete Topic"
        onClickOk={onClickModalOk}
        pendingApiCall={isDeletingTopic}
      />
    </div>
  );
};

export default TopicFeed;