import React, {useState, useMemo} from 'react';
import {DropEvent} from 'react-dropzone';

import {Box, Paper} from '@mui/material';

import core, {Viewer, Worker, ScrollMode} from '@react-pdf-viewer/core';
import {searchPlugin} from '@react-pdf-viewer/search';
import {defaultLayoutPlugin} from '@react-pdf-viewer/default-layout';
import type {ToolbarSlot, TransformToolbarSlot} from '@react-pdf-viewer/toolbar';
import {toolbarPlugin} from '@react-pdf-viewer/toolbar';
import {thumbnailPlugin} from '@react-pdf-viewer/thumbnail';
import {bookmarkPlugin} from '@react-pdf-viewer/bookmark';

import DropzoneArea from "./Dropzone/DropzoneArea";
import Sidebar from "./Sidebar";
import {readFile} from "../helpers";
import PDFDesigner from "./PDFContainer/Designer";


type PDFFile = File | null;

function FileUpload() {
    const [pdfFile, setPdfFile] = useState<PDFFile>(null);
    const [pdfData, setPdfData] = useState<string | ArrayBuffer>("");

    const store = useMemo(function () {
        return core.createStore({
            isCurrentTabOpened: false,
            currentTab: 0,
        });
    }, []);

    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const searchPluginInstance = searchPlugin();
    const toolbarPluginInstance = toolbarPlugin();

    const thumbnailPluginInstance = thumbnailPlugin();
    const {Thumbnails} = thumbnailPluginInstance;


    const bookmarkPluginInstance = bookmarkPlugin();
    const {Bookmarks} = bookmarkPluginInstance;

    const {renderDefaultToolbar, Toolbar} = toolbarPluginInstance;

    const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
        ...slot,
        Download: () => <></>,
        DownloadMenuItem: () => <></>,
        Open: () => <></>,
        OpenMenuItem: () => <></>,
        Print: () => <></>,
        PrintMenuItem: () => <></>,

        Search: () => <></>,
        ShowSearchPopover: () => <></>,

        SwitchScrollMode: () => <></>,
        SwitchScrollModeMenuItem: () => <></>,

        SwitchSelectionMode: () => <></>,
        SwitchSelectionModeMenuItem: () => <></>,

        SwitchTheme: () => <></>,
        SwitchThemeMenuItem: () => <></>,

        SwitchViewMode: () => <></>,
        SwitchViewModeMenuItem: () => <></>,
    });
    const onDrop = async (acceptedFiles: File[], event: DropEvent) => {
        // Ensure only PDF files are accepted
        const isPDF = acceptedFiles.every((file) => file.type === 'application/pdf');

        if (isPDF) {
            setPdfFile(acceptedFiles[0]);

            const result = await readFile(acceptedFiles[0], "dataURL")
            setPdfData(result)
        } else {
            console.error('Invalid file type. Please upload PDF files only.');
        }
    }


    if (!pdfFile) {
        return (
            <Paper elevation={3} style={{padding: 5}}>
                <Box p={3} textAlign="center">
                    <DropzoneArea
                        acceptedFiles={{'application/pdf': [".pdf"]}}
                        dropzoneText={"Drag and drop an image here or click"}
                        onChange={(files) => console.log('Files:', files)}
                        filesLimit={10}
                        onDrop={onDrop}
                    />
                </Box>
            </Paper>
        )
    }

    if (!pdfData) {
        return <div>Loading</div>
    }

    // console.log(Thumbnails)

    return (
        <div>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.js">

                <div
                    style={{
                        height: '500px',
                        // width: '900px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                >
                    <div
                        className="rpv-core__viewer"
                        style={{
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        }}
                    >
                        <div
                            style={{
                                alignItems: 'center',
                                backgroundColor: '#eeeeee',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                padding: '4px',
                            }}
                        >
                            <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                        </div>
                        <div
                            style={{
                                border: '1px solid rgba(0, 0, 0, .3)',
                                flex: 1,
                                display: 'flex',
                                height: '100%',
                                width: '100%',
                            }}>

                            <div
                                style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Viewer
                                    fileUrl={pdfData as string}
                                    plugins={[toolbarPluginInstance, searchPluginInstance, thumbnailPluginInstance]}
                                    scrollMode={ScrollMode.Page}
                                    defaultScale={0.5}
                                />
                            </div>
                            {/*<div*/}
                            {/*    style={{*/}
                            {/*        borderLeft: '1px solid rgba(0, 0, 0, .2)',*/}
                            {/*        flex: '0 0 15rem',*/}
                            {/*        width: '15rem',*/}
                            {/*    }}*/}
                            {/*>*/}
                            <Sidebar
                                searchPluginInstance={searchPluginInstance}
                                thumbnailTabContent={<Thumbnails/>} store={store}
                                bookmarkTabContent={<Bookmarks/>}
                            />
                            {/*</div>*/}
                        </div>
                    </div>
                </div>


                {/*<div*/}
                {/*    style={{*/}
                {/*        height: '500px',*/}
                {/*        // width: '900px',*/}
                {/*        marginLeft: 'auto',*/}
                {/*        marginRight: 'auto',*/}
                {/*    }}*/}
                {/*>*/}
                {/*        <Viewer fileUrl={pdfData as string} plugins={[defaultLayoutPluginInstance]} />*/}
                {/*</div>*/}
            </Worker>


            <Paper elevation={3} style={{padding: 5}}>
                <Box p={3} textAlign="center">
                    <PDFDesigner pdfData={pdfData}/>
                </Box>
            </Paper>
        </div>
    );
}


export default FileUpload;
