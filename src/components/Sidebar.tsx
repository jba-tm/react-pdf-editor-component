import React, {useState, useRef, useEffect} from 'react';
import clsx from "clsx"

import {MinimalButton, Tooltip, Splitter, Position, SplitterSize, Icon, Spinner, TextBox} from '@react-pdf-viewer/core';

import {Match, NextIcon, PreviousIcon, RenderSearchProps, SearchPlugin} from '@react-pdf-viewer/search';


const BookmarkIcon = () => {
    return (
        <Icon size={16}>
            <path
                d="M11.5,1.5h11c0.552,0,1,0.448,1,1v20c0,0.552-0.448,1-1,1h-21c-0.552,0-1-0.448-1-1v-20c0-0.552,0.448-1,1-1h3"/>
            <path
                d="M11.5,10.5c0,0.55-0.3,0.661-0.659,0.248L8,7.5l-2.844,3.246c-0.363,0.414-0.659,0.3-0.659-0.247v-9c0-0.552,0.448-1,1-1h5 c0.552,0,1,0.448,1,1L11.5,10.5z"/>
            <path d="M14.5,6.499h6"/>
            <path d="M14.5,10.499h6"/>
            <path d="M3.5,14.499h17"/>
            <path d="M3.5,18.499h16.497"/>
        </Icon>
    );
};

const ThumbnailIcon = () => {
    return (
        <Icon size={16}>
            <path
                d="M10.5,9.5c0,0.552-0.448,1-1,1h-8c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1-1-1h8c0.552,0,1,0.448,1,1V9.5z M23.5,9.5c0,0.552-0.448,1-1,1h-8c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1-1-1h8c0.552,0,1,0.448,1,1V9.5z M10.5,22.5c0,0.552-0.448,1-1,1h-8c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1-1-1h8c0.552,0,1,0.448,1,1V22.5z M23.5,22.5c0,0.552-0.448,1-1,1 h-8c-0.552,0-1-0.448-1-1v-8c0-0.552,0.448-1-1-1h8c0.552,0,1,0.448,1,1V22.5z"/>
        </Icon>
    );
};

const SearchIcon = () => {
    return (
        <Icon ignoreDirection={true} size={16}>
            <path
                d="M10.5,0.5c5.523,0,10,4.477,10,10s-4.477,10-10,10s-10-4.477-10-10S4.977,0.5,10.5,0.5z M23.5,23.5 l-5.929-5.929"/>
        </Icon>
    );
};

const DownloadIcon = () => {
    return (
        <Icon size={16}>
            <path d="M5.5,11.5c-.275,0-.341.159-.146.354l6.292,6.293a.5.5,0,0,0,.709,0l6.311-6.275c.2-.193.13-.353-.145-.355L15.5,11.5V1.5a1,1,0,0,0-1-1h-5a1,1,0,0,0-1,1V11a.5.5,0,0,1-.5.5Z" />
            <path d="M23.5,18.5v4a1,1,0,0,1-1,1H1.5a1,1,0,0,1-1-1v-4" />
        </Icon>
    );
};



enum SearchStatus {
    NotSearchedYet,
    Searching,
    FoundResults,
}


interface SearchSidebarProps {
    searchPluginInstance: SearchPlugin;
}

const SearchContent: React.FC<SearchSidebarProps> = ({searchPluginInstance}) => {
    const [searchStatus, setSearchStatus] = React.useState(SearchStatus.NotSearchedYet);
    const [matches, setMatches] = React.useState<Match[]>([]);

    const {Search} = searchPluginInstance;

    const renderMatchSample = (match: Match) => {
        //  match.startIndex    match.endIndex
        //      |                       |
        //      ▼                       ▼
        //  ....[_____props.keyword_____]....

        const wordsBefore = match.pageText.substr(match.startIndex - 20, 20);
        let words = wordsBefore.split(' ');
        words.shift();
        const begin = words.length === 0 ? wordsBefore : words.join(' ');

        const wordsAfter = match.pageText.substr(match.endIndex, 60);
        words = wordsAfter.split(' ');
        words.pop();
        const end = words.length === 0 ? wordsAfter : words.join(' ');

        return (
            <div>
                {begin}
                <span style={{backgroundColor: 'rgb(255, 255, 0)'}}>
                    {match.pageText.substring(match.startIndex, match.endIndex)}
                </span>
                {end}
            </div>
        );
    };

    return (
        <Search>
            {(renderSearchProps: RenderSearchProps) => {
                const {currentMatch, keyword, setKeyword, jumpToMatch, jumpToNextMatch, jumpToPreviousMatch, search} =
                    renderSearchProps;

                const handleSearchKeyDown = (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' && keyword) {
                        setSearchStatus(SearchStatus.Searching);
                        search().then((matches) => {
                            setSearchStatus(SearchStatus.FoundResults);
                            setMatches(matches);
                        });
                    }
                };

                return (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            overflow: 'hidden',
                            width: '100%',
                        }}
                    >
                        <div style={{padding: '.5rem'}}>
                            <div style={{position: 'relative'}}>
                                <TextBox
                                    placeholder="Enter to search"
                                    value={keyword}
                                    onChange={setKeyword}
                                    onKeyDown={handleSearchKeyDown}
                                />
                                {searchStatus === SearchStatus.Searching && (
                                    <div
                                        style={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            bottom: 0,
                                            position: 'absolute',
                                            right: '.5rem',
                                            top: 0,
                                        }}
                                    >
                                        <Spinner size="1.5rem"/>
                                    </div>
                                )}
                            </div>
                        </div>
                        {searchStatus === SearchStatus.FoundResults && (
                            <>
                                {matches.length === 0 && 'Not found'}
                                {matches.length > 0 && (
                                    <>
                                        <div
                                            style={{
                                                alignItems: 'center',
                                                display: 'flex',
                                                padding: '.5rem',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    color: 'rgba(0, 0, 0, .5)',
                                                    fontSize: '.8rem',
                                                    marginRight: '.5rem',
                                                }}
                                            >
                                                Found {matches.length} results
                                            </div>
                                            <div style={{marginLeft: 'auto', marginRight: '.5rem'}}>
                                                <MinimalButton onClick={jumpToPreviousMatch}>
                                                    <PreviousIcon/>
                                                </MinimalButton>
                                            </div>
                                            <MinimalButton onClick={jumpToNextMatch}>
                                                <NextIcon/>
                                            </MinimalButton>
                                        </div>
                                        <div
                                            style={{
                                                borderTop: '1px solid rgba(0, 0, 0, .2)',
                                                flex: 1,
                                                overflow: 'auto',
                                                padding: '.5rem 1rem',
                                            }}
                                        >
                                            {matches.map((match, index) => (
                                                <div key={index} style={{margin: '1rem 0'}}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginBottom: '.5rem',
                                                        }}
                                                    >
                                                        <div>#{index + 1}</div>
                                                        <div
                                                            style={{
                                                                color: 'rgba(0, 0, 0, .5)',
                                                                fontSize: '.8rem',
                                                                textAlign: 'right',
                                                            }}
                                                        >
                                                            Page {match.pageIndex + 1}
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            backgroundColor:
                                                                currentMatch === index + 1 ? 'rgba(0, 0, 0, .1)' : '',
                                                            border: '1px solid rgba(0, 0, 0, .2)',
                                                            borderRadius: '.25rem',
                                                            cursor: 'pointer',
                                                            overflowWrap: 'break-word',
                                                            padding: '.5rem',
                                                        }}
                                                        onClick={() => jumpToMatch(index + 1)}
                                                    >
                                                        {renderMatchSample(match)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                );
            }}
        </Search>
    );
};


const TOOLTIP_OFFSET_RTL = {left: -8, top: 0};

interface SidebarProps {
    searchPluginInstance: SearchPlugin;
    store: any;
    bookmarkTabContent: any;
    thumbnailTabContent: any;
}


const Sidebar = ({
                     // attachmentTabContent,
                     bookmarkTabContent,
                     store,
                     thumbnailTabContent,
                     searchPluginInstance
                     // tabs,
                 }: SidebarProps) => {
    const containerRef = useRef<any>();
    const [opened, setOpened] = useState(store.get('isCurrentTabOpened') || false);
    const [currentTab, setCurrentTab] = useState(Math.max(store.get('currentTab') || 0, 0));


    const resizeConstrain = (size: SplitterSize) => size.firstHalfPercentage >= 20 && size.firstHalfPercentage <= 80;

    const listTabs = [
        {
            content: thumbnailTabContent,
            icon: <ThumbnailIcon/>,
            title: 'Thumbnail',
        },
        {
            content: bookmarkTabContent,
            icon: <BookmarkIcon/>,
            title: 'Bookmark',
        },
        {
            content: <SearchContent searchPluginInstance={searchPluginInstance}/>,
            icon: <SearchIcon/>,
            title: 'Search',
        },
        {
            content: <div/>,
            icon: <DownloadIcon/>,
            title: 'Save as PDF',
        },
    ];

    // const listTabs = defaultTabs;

    const toggleTab = (index: number) => {
        if (currentTab === index) {
            store.update('isCurrentTabOpened', !store.get('isCurrentTabOpened'));
            const container = containerRef.current;
            if (container) {
                const width = container.style.width;
                if (width) {
                    container.style.removeProperty('width');
                }
            }
        } else {
            store.update('currentTab', index);
        }
    };

    const switchToTab = (index: number) => {
        if (index >= 0 && index <= listTabs.length - 1) {
            store.update('isCurrentTabOpened', true);
            setCurrentTab(index);
        }
    };

    const handleCurrentTabOpened = (opened: boolean) => {
        setOpened(opened);
    };

    useEffect(() => {
        store.subscribe('currentTab', switchToTab);
        store.subscribe('isCurrentTabOpened', handleCurrentTabOpened);
        return () => {
            store.unsubscribe('currentTab', switchToTab);
            store.unsubscribe('isCurrentTabOpened', handleCurrentTabOpened);
        };
    }, []);

    if (listTabs.length === 0) {
        return <></>;
    }

    return (
        <>
            <div data-testid="default-layout__sidebar" className={clsx({
                'rpv-default-layout__sidebar': true,
                'rpv-default-layout__sidebar--opened': opened,
                "rpv-default-layout__sidebar-content--right": true
            })} ref={containerRef}>
                <div className="rpv-default-layout__sidebar-tabs">
                    <div
                        aria-labelledby={`rpv-default-layout__sidebar-tab-${currentTab}`}
                        id="rpv-default-layout__sidebar-content"
                        className={clsx({
                            'rpv-default-layout__sidebar-content': true,
                            'rpv-default-layout__sidebar-content--opened': opened,
                            "rpv-default-layout__sidebar-content--right": true
                        })}
                        role="tabpanel"
                        tabIndex={-1}
                    >
                        {listTabs[currentTab].content}
                    </div>
                    <div className="rpv-default-layout__sidebar-headers" role="tablist" aria-orientation="vertical">
                        {listTabs.map((tab: any, index: number) => (
                            <div
                                aria-controls="rpv-default-layout__sidebar-content"
                                aria-selected={currentTab === index}
                                key={index}
                                className="rpv-default-layout__sidebar-header"
                                id={`rpv-default-layout__sidebar-tab-${index}`}
                                role="tab"
                            >
                                <Tooltip
                                    position={Position.LeftCenter}
                                    ariaControlsSuffix={`default-layout-sidebar-tab-${index}`}
                                    target={
                                        <MinimalButton
                                            ariaLabel={tab.title}
                                            isSelected={currentTab === index}
                                            onClick={() => toggleTab(index)}
                                        >
                                            {tab.icon}
                                        </MinimalButton>
                                    }
                                    content={() => tab.title}
                                    offset={TOOLTIP_OFFSET_RTL}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {opened && <Splitter constrain={resizeConstrain}/>}
            </div>
        </>
    );
};

export default Sidebar;

