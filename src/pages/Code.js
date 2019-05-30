import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import utils from '../utils';
import { withAuth } from '../auth/AuthProvider';


class Code extends Component {

    state = {
        language: 'none',
        code: 'Choose code file above',
        isLoading: false,
        files: [],
    };

    componentDidMount() {
        this.setState({ isLoading: true });

        this.fetchMyExercise()
            .then(() => this.setState({ isLoading: false }));
    }

    //refactor query to not be hardcoded to exercise but to receive input argument
    fetchMyExercise = async () => {
        const { context } = this.props;
        const response = await fetch(utils.courseServiceUrl + '/courses/0/assignments/1/exercises/3/', context.authorizationHeader());

        if (response.ok) {
            const content = await response.json();

            const files = content.public_files;

            this.setState({ files: files });
        }
    };

    //monaco editor
    editorDidMount = (editor, monaco) => {
        console.log('editorDidMount', editor);
        editor.focus();
        console.log(monaco);
    };

    onChange = (newValue, e) => {
        console.log('onChange', newValue, e);
    };

    //setting code editor language within tabs
    setPython = () => this.setState({ language: 'python' });
    setJs = () => this.setState({ language: 'javascript' });

    setCode = (code) => this.setState({ code: code });

    setTab = (extension, code) => {
        if (extension === 'py') {
            this.setPython();
        } else if (extension === 'js') {
            this.setJs();
        }
        this.setCode(code);
    };

    render() {

        const options = {
            selectOnLineNumbers: true,
        };

        const tabItems = this.state.files.map((c) =>
            <button key={c.name}
                    onClick={() => this.setTab(c.extension, c.content)}>{c.name + '.' + c.extension}</button>,
        );

        return (
            <div className="CodeEditor" style={{ width: '100%' }}>

                {/* render files as tabs */}
                {tabItems}

                <MonacoEditor
                    width="100%"
                    height="1000px"
                    language={this.state.language}
                    theme="vs-dark"
                    value={this.state.code}
                    automaticLayout={true}
                    options={options}
                    quickSuggestions={true}
                    snippetSuggestions={true}
                    wordBasedSuggestions={true}
                    onChange={this.onChange}
                    editorDidMount={this.editorDidMount}
                />
            </div>
        );
    }
}


export default withAuth(Code);