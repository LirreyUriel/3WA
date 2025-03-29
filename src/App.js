import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';
import './App.css';

// Main WhatsApp Analyzer App
const WhatsAppAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [chatData, setChatData] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // All your existing functions...
  // handleFileUpload, parseDate, getWeekNumber, getWeekIdentifier, calculateStats, etc.

  // Filter chat data by search term
  const filteredChatData = searchTerm && chatData.length > 0
    ? chatData.filter(msg => 
        msg.message && msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chatData;

  // Group messages by date for the chat UI
  const groupedByDate = _.groupBy(filteredChatData, 'date');

  const scrollToBottom = () => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [activeTab, filteredChatData]);

  const COLORS = ['#25D366', '#128C7E', '#075E54', '#34B7F1', '#FF5252', '#448AFF', '#7C4DFF', '#FFD740'];

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
            // Manually set the file in the input element to trigger the change event
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
            
            // Trigger the file upload handler
            handleFileUpload({ target: { files: [file] } });
            break;
          } else {
            setError('Please upload a CSV file.');
          }
        }
      }
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <h1>WhatsApp Chat Analyzer</h1>
      </header>
      
      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => fileUploaded ? setActiveTab('chat') : null}
          disabled={!fileUploaded}
        >
          Chat
        </button>
        <button 
          className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => fileUploaded ? setActiveTab('statistics') : null}
          disabled={!fileUploaded}
        >
          Statistics
        </button>
      </div>
      
      <div className="content">
        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="upload-container">
            <div 
              className="drop-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="upload-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              
              <h2>Upload WhatsApp Chat CSV</h2>
              <p>Drag and drop your WhatsApp chat CSV file here, or click to select a file</p>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
                id="file-upload"
              />
              
              <label htmlFor="file-upload" className="upload-btn">
                Select CSV File
              </label>
              
              <div className="file-info">
                <p>Your file should have these columns:</p>
                <code>datetime, date, time, hour, weekday, sender, message</code>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              {loading && (
                <div className="loading">
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        )}
      
        {/* CHAT TAB */}
        {activeTab === 'chat' && fileUploaded && (
          <div className="chat-container white-bg">
            {/* WhatsApp-like header */}
            <div className="chat-header">
              <div className="chat-avatar">
                WA
              </div>
              <div className="chat-info">
                <h3 className="chat-title">
                  {chatData.length > 0 ? 
                    `${_.uniq(chatData.map(msg => msg.sender)).join(', ')}` : 
                    'WhatsApp Chat'
                  }
                </h3>
                <p className="chat-subtitle">
                  {chatData.length} messages, {_.uniq(chatData.map(msg => msg.sender)).length} participants
                </p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search in chat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            {/* Chat Messages */}
            <div className="chat-messages white-bg">
              {Object.keys(groupedByDate).length === 0 ? (
                <div className="no-messages">
                  <p>No messages found</p>
                </div>
              ) : (
                <div className="message-container">
                  {Object.entries(groupedByDate).map(([date, messages]) => (
                    <div key={date} className="date-group">
                      {/* Date Divider */}
                      <div className="date-divider">
                        <div className="date-label">
                          {date}
                        </div>
                      </div>
                      
                      {/* Messages for this date */}
                      {messages.map((msg, idx) => {
                        // Determine if message is from the first sender (user)
                        const isOutgoing = msg.sender === chatData[0]?.sender;
                        
                        return (
                          <div 
                            key={`${date}-${idx}`} 
                            className={`message-row ${isOutgoing ? 'outgoing' : 'incoming'}`}
                          >
                            <div className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                              {!isOutgoing && (
                                <div className="sender-name">
                                  {msg.sender}
                                </div>
                              )}
                              
                              <div className="message-content">
                                {msg.message}
                              </div>
                              
                              <div className="message-time">
                                {msg.time ? msg.time.split(':').slice(0, 2).join(':') : ''}
                                {isOutgoing && <span className="check-marks">✓✓</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* STATISTICS TAB */}
        {activeTab === 'statistics' && fileUploaded && stats && (
          <div className="stats-container">
            <h2 className="section-title">Chat Statistics</h2>
            
            {/* Most Active Day and Week */}
            <div className="stat-card">
              <h3 className="stat-title">Most Active Periods</h3>
              <div className="stats-grid">
                <div>
                  <h4 className="subsection-title">Most Active Day</h4>
                  <p className="stat-highlight">
                    <span className="stat-value">{stats.mostActiveDay.date}</span> with{' '}
                    <span className="stat-value highlight">{stats.mostActiveDay.count}</span> messages
                  </p>
                </div>
                <div>
                  <h4 className="subsection-title">Most Active Week</h4>
                  <p className="stat-highlight">
                    <span className="stat-value">{stats.mostActiveWeek.week}</span> with{' '}
                    <span className="stat-value highlight">{stats.mostActiveWeek.count}</span> messages
                  </p>
                </div>
              </div>
            </div>
            
            {/* Monthly Timeline Chart */}
            <div className="stat-card">
              <h3 className="stat-title">Monthly Message Timeline</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#25D366" name="Messages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Daily Timeline Chart */}
            <div className="stat-card">
              <h3 className="stat-title">Daily Message Timeline (Last 30 Days)</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#34B7F1" name="Messages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Average Messages by Weekday */}
            <div className="stat-card">
              <h3 className="stat-title">Average Messages by Day of Week</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weekdayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg" fill="#25D366" name="Average Messages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Messages by Hour */}
            <div className="stat-card">
              <h3 className="stat-title">Messages by Hour of Day</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.hourData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#128C7E" name="Messages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Who Sends More Messages */}
            <div className="stat-card">
              <h3 className="stat-title">Who Sends More Messages?</h3>
              <div className="pie-chart-grid">
                <div className="pie-section">
                  <h4 className="subsection-title">Total Messages</h4>
                  <div className="pie-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.senderData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="messages"
                        >
                          {stats.senderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="legend-container">
                    {stats.senderData.map((sender, index) => (
                      <div key={sender.name} className="legend-item">
                        <div className="color-box" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{sender.name}: {sender.messages} messages</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pie-section">
                  <h4 className="subsection-title">Total Words</h4>
                  <div className="pie-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.senderData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="words"
                        >
                          {stats.senderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="legend-container">
                    {stats.senderData.map((sender, index) => (
                      <div key={sender.name} className="legend-item">
                        <div className="color-box" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{sender.name}: {sender.words} words</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Most Common Words */}
            <div className="stat-card">
              <h3 className="stat-title">Most Common Words</h3>
              <div className="vertical-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats.topWords} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="word" 
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#075E54" name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Most Common Phrases */}
            <div className="stat-card">
              <h3 className="stat-title">Most Common Phrases</h3>
              <div className="vertical-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats.topPhrases} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="phrase" 
                      tick={{ fontSize: 12 }}
                      width={120}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#128C7E" name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* NO DATA MESSAGE */}
        {!fileUploaded && (activeTab === 'chat' || activeTab === 'statistics') && (
          <div className="no-data">
            <div className="warning-icon">⚠️</div>
            <h2>No Data Available</h2>
            <p>Please upload a WhatsApp chat CSV file first.</p>
            <button 
              onClick={() => setActiveTab('upload')} 
              className="upload-btn"
            >
              Go to Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppAnalyzer;
