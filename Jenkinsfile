node('macosx') {
    ws("/Users/jenkins/build/hanzi.hero/${env.BRANCH_NAME.replace('/', '-')}") {
        checkout scm
        echo "Running on a Mac OSX Node"
        echo "Branch is: ${env.BRANCH_NAME}"
        sh 'nodenv update-version-defs'
        sh 'nodenv install || :'
        sh 'yarn'
        sh 'npm run build'
        if (env.BRANCH_NAME == "master"){
          sh 'npm publish'
        }
    }
}
