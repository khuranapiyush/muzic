import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null, errorInfo: null};
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log to analytics if available
    try {
      const analyticsUtils = require('../../utils/analytics').default;
      if (analyticsUtils && analyticsUtils.trackCustomEvent) {
        analyticsUtils.trackCustomEvent('error_boundary_triggered', {
          error_message: error?.message || 'Unknown error',
          error_stack: error?.stack || 'No stack trace',
          component_stack: errorInfo?.componentStack || 'No component stack',
          error_name: error?.name || 'Unknown error type',
        });
      }
    } catch (analyticsError) {
      console.warn('Failed to log error to analytics:', analyticsError);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              The app encountered an unexpected error. Please try again.
            </Text>

            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  {this.state.error?.message || 'No error message'}
                </Text>
                <Text style={styles.debugText}>
                  {this.state.error?.name || 'Unknown error type'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    maxWidth: 300,
    alignItems: 'center',
  },
  errorTitle: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  debugContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    maxWidth: '100%',
  },
  debugTitle: {
    color: '#FFD93D',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    color: '#CCC',
    fontSize: 10,
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;
