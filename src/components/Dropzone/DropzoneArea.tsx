import React from 'react';

import {createFileFromUrl, readFile} from '../../helpers';

import DropzoneAreaBase, {DropzoneAreaBaseProps, FileObject} from './DropzoneAreaBase';


interface DropzoneAreaProps extends DropzoneAreaBaseProps {
    clearOnUnmount: boolean;
    initialFiles: (string | File)[];
    onChange: (loadedFiles: File[]) => void;
}


const splitDropzoneAreaProps = (props: {
    onChange: (loadedFiles: File[]) => void;
    onDelete?: (deletedFileObject: FileObject, index: number) => void;
    initialFiles: (string | File)[];
    clearOnUnmount: boolean;
}) => {
    const {clearOnUnmount, initialFiles, onChange, onDelete, ...dropzoneAreaProps} = props;
    return [{clearOnUnmount, initialFiles, onChange, onDelete}, dropzoneAreaProps];
};

/**
 *
 * It supports all props of `DropzoneAreaBase` but keeps the files state internally.
 *
 * **Note** To listen to file changes use `onChange` event handler and notice that `onDelete` returns a `File` instance instead of `FileObject`.
 */
class DropzoneArea extends React.PureComponent<DropzoneAreaProps> {
    static defaultProps: Partial<DropzoneAreaProps> = {
        clearOnUnmount: true,
        filesLimit: 3,
        initialFiles: [],
    }

    state: { fileObjects: FileObject[] } = {
        fileObjects: [],
    }

    async componentDidMount() {
        await this.loadInitialFiles();
    }

    componentWillUnmount() {
        const {clearOnUnmount} = this.props;

        if (clearOnUnmount) {
            this.setState({
                fileObjects: [],
            }, this.notifyFileChange);
        }
    }

    notifyFileChange = () => {
        const {onChange} = this.props;
        const {fileObjects} = this.state;

        if (onChange) {
            onChange(fileObjects.map((fileObject) => fileObject.file));
        }
    }

    loadInitialFiles = async () => {
        const {initialFiles} = this.props;
        try {
            const fileObjs = await Promise.all(
                initialFiles.map(async (initialFile) => {
                    let file;
                    if (typeof initialFile === 'string') {
                        file = await createFileFromUrl(initialFile);
                    } else {
                        file = initialFile;
                    }
                    const data = await readFile(file, "dataURL");
                    return {
                        file,
                        data,
                    };
                })
            );

            this.setState((state: { fileObjects: FileObject[] }) => {
                const result = [
                    ...state.fileObjects,
                    ...fileObjs,
                ]
                return {
                    fileObjects: result,
                }
            }, this.notifyFileChange);
        } catch (err) {
            console.log(err);
        }
    }

    addFiles = async (newFileObjects: FileObject[]) => {
        const {filesLimit} = this.props;
        // Update component state
        this.setState((state: { fileObjects: FileObject[] }) => {
            // Handle a single file
            if ((!filesLimit || filesLimit <= 1) && newFileObjects.length > 0) {
                const result = [...newFileObjects]
                return {fileObjects: result};
            }

            // Handle multiple files
            const result = [
                ...state.fileObjects,
                ...newFileObjects,
            ]
            return {
                fileObjects: result,
            };
        }, this.notifyFileChange);
    }

    deleteFile = (removedFileObj: FileObject, removedFileObjIdx: number) => {
        const {onDelete} = this.props;
        const {fileObjects} = this.state;

        // Calculate remaining fileObjects array
        const remainingFileObjs = fileObjects.filter((fileObject, i) => {
            return i !== removedFileObjIdx;
        });

        // Notify removed file
        if (onDelete) {
            onDelete(removedFileObj, removedFileObjIdx);
        }

        // Update local state
        this.setState({
            fileObjects: remainingFileObjs,
        }, this.notifyFileChange);
    }

    render() {
        const [,dropzoneAreaProps] = splitDropzoneAreaProps(this.props);
        const {fileObjects} = this.state;

        return (
            <DropzoneAreaBase
                {...dropzoneAreaProps}
                fileObjects={fileObjects}
                onAdd={this.addFiles}
                onDelete={this.deleteFile}
            />
        );
    }
}


export default DropzoneArea;
